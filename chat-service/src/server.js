const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const mysql = require("mysql2/promise");
let config = require('./config.js');

const PROTO_PATH = "src/chat.proto";
const SERVER_URI = "0.0.0.0:9090";

let clients = [];
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
                          read_flag int not null default 0,
                          primary key (id)
                      )`;

            await connection.query(createTable);
            console.log(`Successfully created table messages!`);
        });
    } catch (err) {
        console.log('Failed to create table: ', err.message);
        process.exit(1);
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

const getAllHistory = async (call, callback) => {
    console.log(`Retrieve chat history for all users!`);

    try {
        await transaction(pool, async connection => {
            let sql = `select * from messages where to_user=? or from_user=?`;
            const results = await connection.query(sql, [ADMIN, ADMIN]);
            console.log(`Retrieved rows:`, results[0].length);
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
            callback(null, {history: chatHistory});
        });
    } catch (err) {
        console.error('Failed to retrieve all chat history: ', err.message);
    }
}

const getHistory = async (call, callback) => {
    const user = call.request.name;
    console.log(`Retrieve chat history for client ${user}`);

    try {
        await transaction(pool, async connection => {
            let sql = `select * from messages where to_user=? or from_user=?`;
            const results = await connection.query(sql, [user, user]);
            console.log(`Retrieved rows:`, results[0].length);
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
            callback(null, {history: chatHistory});
        });
    } catch (err) {
        console.error('Failed to retrieve chat history: ', err.message);
    }
}

const receiveMsg = (call, callback) => {
    const user = call.request.name;
    const str = messageStreams.get(user);

    if (call.request.role === ADMIN) {
        const clientStr = (str === undefined) ? undefined : str.client;
        messageStreams.set(user, {client: clientStr, admin: {call}});
        console.log('Register Admin for receiving messages from ' + user);
    } else {
        const adminStr = (str === undefined) ? undefined : str.admin;
        messageStreams.set(user, {client: {call}, admin: adminStr});
        console.log(`Register client ${user} for receiving messages from admin`);
    }
};

const sendMsg = async (call, callback) => {
    const chatObj = call.request;
    console.log(`Sending message ${chatObj.msg} from ${chatObj.from} to ${chatObj.to}`);

    // set message type
    chatObj.type = 1;
    chatObj.read = 0;

    try {
        await transaction(pool, async connection => {
            // insert msg to db
            const sql = `insert into messages(from_user, to_user, msg, timestamp, read_flag) values(?)`;
            // execute the insert statement
            const messageData = [chatObj.from, chatObj.to, chatObj.msg, chatObj.timestamp, chatObj.read];
            await connection.query(sql, [messageData]);

            const sqlGetLastId = `select last_insert_id()`;
            const results = await connection.query(sqlGetLastId, [messageData]);
            const id = results[0][0]['last_insert_id()'];
            console.log(`Inserted row with id:`, id);
            chatObj.id = id;

            let client = (chatObj.to === ADMIN) ? chatObj.from : chatObj.to;
            const stream = messageStreams.get(client);
            if (stream.client !== undefined) {
                stream.client.call.write(chatObj);
            }
            if (stream.admin !== undefined) {
                stream.admin.call.write(chatObj);
            }
        });
    } catch (error) {
        console.error('Failed to insert messages: ', error.message);
    }
    callback(null, {});
};

const type = (call, callback) => {
    let chatObj = call.request;
    // set message type
    chatObj.type = 2;

    let client = (chatObj.to === ADMIN) ? chatObj.from : chatObj.to;
    const stream = messageStreams.get(client);
    if (stream.client !== undefined) {
        stream.client.call.write(chatObj);
    }
    if (stream.admin !== undefined) {
        stream.admin.call.write(chatObj);
    }
    callback(null, {});
};

const readMsg = async (call, callback) => {
    let chatObj = call.request;
    const from = chatObj.from;
    const to = chatObj.to;
    const read = chatObj.read;
    const id = chatObj.id;

    if (read === 1) {
        console.log(`User ${from} has read the messages with id ${id}`);

        try {
            await transaction(pool, async connection => {
                // update the message in DB
                const sql = `update messages set read_flag=1 where id=?`;
                // execute the update statement
                const results = connection.query(sql, [id]);
                console.log(`Updated row with id ${id}`);
            });

            // set message type
            chatObj.type = 3;
            let client = (from === ADMIN) ? to : from;
            const stream = messageStreams.get(client);
            console.log(chatObj)
            if (stream.client !== undefined) {
                stream.client.call.write(chatObj);
            }
            if (stream.admin !== undefined) {
                stream.admin.call.write(chatObj);
            }
        } catch (error) {
            console.error('Failed to update read message: ', error.message);
        }
    }
    callback(null, {});
};

const leave = (call, callback) => {
    const user = call.request.user;
    console.log(`User ${user} has left the chat!`);

    clients = clients.filter(client => client.name !== user.name);
    messageStreams.delete(user.name);
}


async function main() {
    // connect to db
    console.log("Connecting to db...");
    await connectToDb();

    const server = new grpc.Server();

    server.addService(protoDescriptor.ChatService.service, {
        receiveJoinNotification,
        receiveMsg,
        join,
        sendMsg,
        type,
        readMsg,
        getHistory,
        getAllHistory,
        getAllClients,
        leave
    });

    server.bindAsync(SERVER_URI, grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log("Server running at " + SERVER_URI);
    });
}

main().then(() => console.log('Application started'));