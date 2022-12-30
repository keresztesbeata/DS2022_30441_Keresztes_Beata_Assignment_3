const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const mysql = require("mysql2/promise");
let config = require('./config.js');

const PROTO_PATH = "src/chat.proto";
const SERVER_URI = "0.0.0.0:9090";

let clients = [];
let msgReadStreams = new Map([]);
let typingStreams = new Map([]);
let messageStreams = new Map([]);
let joinNotifications = null;

const ADMIN = "ADMIN";

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

// create a connection to DB
let pool = null;

async function transaction(pool, callback) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        await callback(connection);
        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

const connectToDb = async () => {
    pool = await mysql.createPool(config);
    console.log('Connected to the MySQL server.');

    try {
        await transaction(pool, async connection => {
            const createTable = `create table if not exists messages(
                          id int not null auto_increment,
                          from_user varchar(250) not null,
                          to_user varchar(250) not null,
                          msg varchar(1000),
                          timestamp varchar(250) not null,
                          read_flag int default 0,
                          primary key (id)
                      )`;

            await connection.query(createTable);
            console.log(`Successfully created table messages!`);
        });
    } catch (err) {
        console.log('Failed to create table: ', err.message);
    }
}

const receiveJoinNotification = (call, callback) => {
    // subscribe to events about new clients requesting a chat with the admin
    const name = call.request.name;
    const role = call.request.role;
    if (role === ADMIN) {
        joinNotifications = {call};
        console.log(`Register admin to receive notifications about new clients joining the chat.`);
    }
}

const join = (call, callback) => {
    const user = call.request;

    if (clients.find(client => client.name === user.name) !== undefined) {
        console.log(`User ${user.name} was already in the chat!`);
        callback(null, {
            error: 1,
            msg: `User ${user.name} was already in the chat!`
        });
    } else {
        clients.push(user);
        console.log(`User ${user.name} joined the chat!`);

        // notify admin about the new client starting the chat
        if (joinNotifications !== null) {
            joinNotifications.call.write(user);
            console.log(`Received chat request from client ${user.name}.`);
        } else {
            console.log('Admin not available.')
        }

        callback(null, {
            error: 0,
            msg: "Success",
        });
    }
};

const getAllClients = (call, callback) => {
    console.log(`Retrieve all clients waiting to chat: ${clients.length}`);
    console.log(clients);
    callback(null, {users: clients});
};

const getHistory = async (call, callback) => {
    const user = call.request.name;
    console.log(`Retrieve chat history for client ${user}`);

    try {
        await transaction(pool, async connection => {
            let sql = `select * from messages where to_user=? or from_user=?`;
            const results = await connection.query(sql, [user, user]);
            console.log(`Retrieved rows:`, results[0].length);
            console.log(results[0])
            const chatHistory = results[0].map(row => {
                return {
                    id: row.id,
                    from: row.from_user,
                    to: row.to_user,
                    msg: row.msg,
                    timestamp: row.timestamp,
                    read: row.read_flag
                }
            });
            console.log(chatHistory);
            callback(null, {history: chatHistory});
        });
    } catch (err) {
        console.error('Failed to retrieve chat history: ', err.message);
    }
}

const receiveMsg = (call, callback) => {
    const name = call.request.name;
    const str = messageStreams.get(name);

    if (call.request.role === ADMIN) {
        const clientStr = (str === undefined) ? undefined : str.client;
        messageStreams.set(name, {client: clientStr, admin: {call}});
        console.log('Register Admin for receiving messages from ' + name);
    } else {
        const adminStr = (str === undefined) ? undefined : str.admin;
        messageStreams.set(name, {client: {call}, admin: adminStr});
        console.log(`Register client ${name} for receiving messages from admin`);
    }
};

const receiveTypeNotification = (call, callback) => {
    const name = call.request.name;
    const str = typingStreams.get(name);

    if (call.request.role === ADMIN) {
        const clientStr = (str === undefined) ? undefined : str.client;
        typingStreams.set(name, {client: clientStr, admin: {call}});
        console.log('Register Admin for receiving typing notifications from ' + name);
    } else {
        const adminStr = (str === undefined) ? undefined : str.admin;
        typingStreams.set(name, {client: {call}, admin: adminStr});
        console.log(`Register client ${name} for receiving typing notifications from admin`);
    }
};

const receiveReadMsgNotification = (call, callback) => {
    const name = call.request.name;
    msgReadStreams.set(name, {call});
    console.log(`Register user ${name} for receiving message read notifications`);
};

const sendMsg = async (call, callback) => {
    const chatObj = call.request;

    console.log(`Sending message ${chatObj.msg} from ${chatObj.from} to ${chatObj.to}`);

    let client = (chatObj.to === ADMIN) ? chatObj.from : chatObj.to;

    const stream = messageStreams.get(client);

    if (stream.client !== undefined) {
        stream.client.call.write(chatObj);
    }

    if (stream.admin !== undefined) {
        stream.admin.call.write(chatObj);
    }

    try {
        await transaction(pool, async connection => {
            // insert msg to db
            const sql = `insert into messages(from_user, to_user, msg, timestamp, read_flag) values(?)`;
            // execute the insert statement
            const messageData = [chatObj.from, chatObj.to, chatObj.msg, chatObj.timestamp, chatObj.read];
            const results = await connection.query(sql, [messageData])
            console.log(`Inserted rows:`, results[0].affectedRows);
            callback(null, {});
        });
    } catch (error) {
        console.error('Failed to insert messages: ', error.message);
    }
};

const type = (call, callback) => {
    const name = call.request.name;
    const role = call.request.role;

    const stream = typingStreams.get(name);

    if (role === ADMIN) {
        console.log(`Admin is typing`);
        if (stream.client !== undefined) {
            stream.client.call.write(call.request);
        }
    } else {
        console.log(`User ${name} is typing`);
        if (stream.admin !== undefined) {
            stream.admin.call.write(call.request);
        }
    }
    callback(null, {});
};

const readMsg = async (call, callback) => {
    const user = call.request.user;
    const ids = call.request.ids;

    console.log(`User ${user} has read the messages with ids ${ids}`);
    const stream = msgReadStreams.get(user);
    stream.call.write(call.request);

    try {
        await transaction(pool, async connection => {
            // update the messages in DB
            // insert msg to db
            const sql = `update messages set read_flag=1 where id in (?)`;
            // execute the insert statement
            const results = await connection.query(sql, [ids]);
            console.log(`Updated rows:`, results[0].affectedRows);
            callback(null, {});
        });
    } catch (error) {
        console.error('Failed to update read messages: ', error.message);
    }
};

const server = new grpc.Server();

const leave = (call, callback) => {
    const user = call.request.user;
    console.log(`User ${user} has left the chat!`);

    clients = clients.filter(client => client.name !== user.name);
    messageStreams.delete(user.name);
    typingStreams.delete(user.name);
    msgReadStreams.delete(user.name);
}

server.addService(protoDescriptor.ChatService.service, {
    receiveJoinNotification,
    receiveMsg,
    receiveTypeNotification,
    receiveReadMsgNotification,
    join,
    sendMsg,
    type,
    readMsg,
    getHistory,
    getAllClients,
    leave
});

server.bind(SERVER_URI, grpc.ServerCredentials.createInsecure());

server.start();
console.log("Server is running!");

// connect to db
console.log("Connecting to db...");
connectToDb();