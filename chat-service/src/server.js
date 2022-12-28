const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "src/chat.proto";
const SERVER_URI = "0.0.0.0:9090";

let clients = [];
let admin = null;
let clientStreams = new Map([]);
let adminStreams = new Map([]);
let joinNotifications = null;

const ADMIN = "ADMIN";

let id = 1;

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const notifyAdmin = (call, callback) => {
    // subscribe to events about new clients requesting a chat with the admin
    admin = call.request.name;
    joinNotifications = {call};
    console.log(`Subscribed to chat requests.`);
}

const join = (call, callback) => {
    const user = call.request;

    if(clients.find(client => client.name === user.name) === undefined) {
        clients.push(user);
    }
    console.log(`User ${user.name} joined the chat!`);

    // notify admin about the new client starting the chat
    if (joinNotifications !== null) {
        joinNotifications.call.write(user);
        console.log(`New chat request from client ${user.name}`);
    }else{
        console.log('Admin not available.')
    }

    callback(null, {
        error: 0,
        msg: "Success",
    });
};

const getAllClients = (call, callback) => {
    console.log(`Retrieve all users in chat: ${clients.length}`);
    console.log(clients);
    callback(null, {users: clients});
};

const receiveMsg = (call, callback) => {
    const client = call.request.user;

    if (call.request.admin === 1) {
        console.log('Register Admin for receiving messages');
        adminStreams.set(client, {call});
    } else {
        console.log(`Register user ${client} for receiving messages`);
        clientStreams.set(client, {call});
    }
};

const sendMsg = (call, callback) => {
    const chatObj = call.request;

    console.log(`Sending message ${chatObj.msg} from ${chatObj.from} to ${chatObj.to}`);

    // set id for msg
    chatObj.id = id;
    id = id + 1;

    let client = (chatObj.to === ADMIN) ? chatObj.from : chatObj.to;

    clientStreams.get(client).call.write(chatObj);
    if(adminStreams.get(client) !== undefined) {
        adminStreams.get(client).call.write(chatObj);
    }

    callback(null, {});
};

const server = new grpc.Server();

const leave = (call, callback) => {
    const user = call.request.user;
    console.log(`User ${user} has left the chat!`);

    clients = clients.filter(client => client.name !== user.name);
    clientStreams.delete(user.name);
    adminStreams.delete(user.name);
}

server.addService(protoDescriptor.ChatService.service, {
    join,
    notifyAdmin,
    sendMsg,
    getAllClients,
    receiveMsg,
    leave
});

server.bind(SERVER_URI, grpc.ServerCredentials.createInsecure());

server.start();
console.log("Server is running!");