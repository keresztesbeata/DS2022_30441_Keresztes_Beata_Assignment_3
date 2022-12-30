import React, {useState} from 'react'
import {Button} from "react-bootstrap";
import {ChatServiceClient} from "./chat_grpc_web_pb";
import {ADMIN_ROLE, USERNAME} from "../common/auth/Authentication";
import {SimpleChatComponent} from "./SimpleChatComponent";

const CHAT_SERVICE_URL = "http://localhost:8081";

export const AdminChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [joined, setJoined] = useState(false);
    const [users, setUsers] = useState([]);
    const [isTyping, setIsTyping] = useState([]);
    const username = sessionStorage.getItem(USERNAME);

    const {User} = require("./chat_pb");
    const {ChatServiceClient} = require("./chat_grpc_web_pb");
    const {ChatMessage, Empty, MsgReadNotification} = require('./chat_pb.js');
    const client = new ChatServiceClient(CHAT_SERVICE_URL, null, null);

    const mapMessage = (chatMessage) => {
        const from = chatMessage.getFrom();
        const to = chatMessage.getTo();
        const msg = chatMessage.getMsg();
        const timestamp = chatMessage.getTimestamp();
        const read = chatMessage.getRead();

        return {from: from, to: to, msg: msg, timestamp: timestamp, read: read};
    }

    const listenToMessages = (user) => {
        console.log(`Subscribing to message stream of user ${user}.`)

        const strRq = new User();
        strRq.setName(user);
        strRq.setRole(ADMIN_ROLE);

        let chatStream = client.receiveMsg(strRq, {});
        chatStream.on("data", (response) => {
            setMessages(prevState => [...prevState, mapMessage(response)]);
            if (response.getFrom() !== username) {
                onMsgRead([response.getId()]);
            }
            console.log(`Received message ${response.getMsg()} from ${response.getFrom()}`);
        });

        chatStream.on("status", function (status) {
            console.log(status.code, status.details, status.metadata);
        });

        chatStream.on("end", () => {
            console.log("Stream ended.");
            chatStream.cancel();
        });
    }

    const listenToMsgReadNotifications = () => {
        console.log(`Subscribing to message read notification stream.`)

        const strRq = new User();
        strRq.setName(username);
        strRq.setRole(ADMIN_ROLE);

        let readMsgStream = client.receiveReadMsgNotification(strRq, {});
        readMsgStream.on("data", (response) => {
            const userRead = response.getUser();
            if(userRead !== username) {
                const idsList = response.getIdsList();
                console.log(`User ${userRead} has read messages with ids: `, idsList);
                const readMessages = messages.map(m => idsList.includes(m.id) ? {m, read: 1} : m);
                setMessages(readMessages);
                console.log(`User ${userRead} read ${idsList.length} messages!`);
            }
        });

        readMsgStream.on("status", function (status) {
            console.log(status.code, status.details, status.metadata);
        });

        readMsgStream.on("end", () => {
            console.log("Stream ended.");
            readMsgStream.cancel();
        });
    }

    const listenToTypingNotifications = (user) => {
        console.log(`Subscribing to typing notification stream of user ${user}.`)

        const strRq = new User();
        strRq.setName(user);
        strRq.setRole(ADMIN_ROLE);

        let typeNotificationStream = client.receiveTypeNotification(strRq, null);
        typeNotificationStream.on("data", (response) => {
            const userTyping = response.getName();
            if (response.getRole() !== ADMIN_ROLE) {
                console.log(`User ${userTyping} is typing`);
                if (isTyping.find(u => u === userTyping) === undefined) {
                    setIsTyping(prevState => [...prevState, userTyping]);
                }
                setTimeout(function () {
                    const typing = isTyping.filter(u => u !== userTyping);
                    setIsTyping(typing);
                }, 1000);
            }
        });

        typeNotificationStream.on("status", function (status) {
            console.log(status.code, status.details, status.metadata);
        });

        typeNotificationStream.on("end", () => {
            console.log("Stream ended.");
            typeNotificationStream.cancel();
        });
    }

    const subscribeToNotifications = (user) => {
        // start listening to messages from the new user
        if (users.find(u => u === user)) {
            console.log(`Already subscribed to all notification streams of user ${user}`);
        } else {
            setUsers(prevState => [...prevState, user]);
        }
        listenToTypingNotifications(user);
        listenToMessages(user);
    }

    const onJoin = () => {
        client.getAllClients(new Empty(), {}, (err, response) => {
            const usersList = response.getUsersList().map(u => u.getName());
            console.log("Retrieved clients: " + usersList);
            usersList.forEach(u => {
                subscribeToNotifications(u);
                console.log(`Subscribed to notification channels of user ${u}!`);
            });
            setJoined(true);
        });

        listenToMsgReadNotifications();

        const user = new User();
        user.setName(username);

        let notificationStream = client.receiveJoinNotification(user, {});
        notificationStream.on("data", (response) => {
            const userJoined = response.getName();
            subscribeToNotifications(userJoined);
            console.log(`User ${userJoined} has joined the chat and you started listening to its notification channels!`);
        });
    }

    const onSendMessage = (message, to) => {
        const msg = new ChatMessage();
        msg.setMsg(message);
        msg.setFrom(username);
        msg.setTo(to);
        msg.setRead(0);
        const sentTime = new Date().toLocaleString();
        msg.setTimestamp(sentTime);

        client.sendMsg(msg, {}, (err, response) => {
            console.log(`Sent message ${message}!`);
        });
    }

    const onTyping = (to) => {
        const user = new User();
        user.setName(to);
        user.setRole(ADMIN_ROLE);

        client.type(user, {}, (err, response) => {
            console.log(`Admin typing response to user ${to}!`);
        });
    }

    const onMsgRead = (ids) => {
        const msgReadNotification = new MsgReadNotification();
        msgReadNotification.setUser(username);
        msgReadNotification.setIdsList(ids);

        client.readMsg(msgReadNotification, {}, (err, response) => {
            console.log(`Admin read message with ids: ${ids}!`);
        });
    }

    const getChatHistory = (user) => {
        let req = new User();
        req.setName(user);
        client.getHistory(req, {}, (err, response) => {
            console.log(`Retrieved chat history for user ${user}: ${response.getHistoryList().length} messages`);
            const history = messages.filter(msg => msg.from !== user || msg.to !== user);
            setMessages(history);
            const historyList = response.getHistoryList();
            if (historyList.length > 0) {
                historyList.forEach(msg => {
                    setMessages(prevState => [...prevState, mapMessage(msg)]);
                });
                const ids = historyList.filter(msg => msg.getFrom() !== username).map(msg => msg.getId());
                if(ids.length > 0) {
                    onMsgRead(ids);
                }
            }
        });
    }

    const displayChatComponent = (user) =>
        <SimpleChatComponent
            user={user}
            isTyping={isTyping.find(u => u === user) !== undefined}
            messages={messages.filter(m => m.from === user || m.to === user)}
            onSendMessage={(message) => onSendMessage(message, user)}
            onShowCallback={() => getChatHistory(user)}
            onTyping={() => onTyping(user)}
        />;

    return (
        joined ?
            (users.length > 0 ?
                <div className={"d-flex flex-row align-items-start gap-2"}>
                    {users.map(user => displayChatComponent(user))}
                </div>
                :
                <div/>)
            :
            <Button onClick={onJoin}>Join chat</Button>
    )

}