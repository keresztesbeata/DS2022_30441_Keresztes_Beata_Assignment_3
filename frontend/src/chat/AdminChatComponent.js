import React, {useState} from 'react'
import {Button} from "react-bootstrap";
import {ADMIN_ROLE} from "../common/auth/Authentication";
import {SimpleChatComponent} from "./SimpleChatComponent";

const CHAT_SERVICE_URL = "http://localhost:8081";

export const AdminChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [joined, setJoined] = useState(false);
    const [users, setUsers] = useState([]);
    const [isTyping, setIsTyping] = useState([]);

    const {User} = require("./chat_pb");
    const {ChatServiceClient} = require("./chat_grpc_web_pb");
    const {ChatMessage, Empty} = require('./chat_pb.js');
    const client = new ChatServiceClient(CHAT_SERVICE_URL, null, null);

    const mapMessage = (chatMessage) => {
        const id = chatMessage.getId();
        const from = chatMessage.getFrom();
        const to = chatMessage.getTo();
        const msg = chatMessage.getMsg();
        const timestamp = chatMessage.getTimestamp();
        const read = chatMessage.getRead();

        return {id: id, from: from, to: to, msg: msg, timestamp: timestamp, read: read};
    }

    const onMsgReceivedNotification = (response) => {
        setMessages(prevState => [...prevState, mapMessage(response)]);
        console.log(`Received message ${response.getMsg()} from ${response.getFrom()}`);
    }

    const onTypingNotification = (response) => {
        const from = response.getFrom();
        if (from !== ADMIN_ROLE) {
            console.log(`User ${from} is typing`);
            if (isTyping.find(u => u === from) === undefined) {
                setIsTyping(prevState => [...prevState, from]);
            }
            setTimeout(function () {
                const typing = isTyping.filter(u => u !== from);
                setIsTyping(typing);
            }, 1000);
        }
    }

    const listenToMessages = async (user) => {
        const strRq = new User();
        strRq.setName(user);
        strRq.setRole(ADMIN_ROLE);

        let chatStream = await client.receiveMsg(strRq, {});
        chatStream.on("data", (response) => {
            if (response.getType() === 1) {
                onMsgReceivedNotification(response);
            } else if (response.getType() === 2) {
                onTypingNotification(response);
            } else if (response.getType() === 3) {
                getChatHistory(user);
            }
        });

        chatStream.on("status", function (status) {
            console.log(status.code, status.details, status.metadata);
        });

        chatStream.on("end", () => {
            console.log("Stream ended.");
            chatStream.cancel();
        });
    }

    const subscribeToNotifications = async (user) => {
        // start listening to messages from the new user
        if (users.find(u => u === user)) {
            console.log(`Already subscribed to all notification streams of user ${user}`);
        } else {
            setUsers(prevState => [...prevState, user]);
        }
        await listenToMessages(user);
    }

    const onJoin = () => {
        client.getAllClients(new Empty(), {}, (err, response) => {
            const usersList = response.getUsersList().map(u => u.getName());
            console.log("Retrieved clients: " + usersList);
            usersList.forEach(u => {
                subscribeToNotifications(u)
                    .then(() => {
                        console.log(`Subscribed to notification channels of user ${u}!`);
                    });
            });
            setJoined(true);
        });

        const user = new User();
        user.setName(ADMIN_ROLE);
        user.setRole(ADMIN_ROLE);

        let notificationStream = client.receiveJoinNotification(user, {});
        notificationStream.on("data", (response) => {
            const userJoined = response.getName();
            subscribeToNotifications(userJoined)
                .then(() => {
                    console.log(`User ${userJoined} has joined the chat and you started listening to its notification channels!`);
                });
        });
    }

    const onSendMessage = (message, to) => {
        const msg = new ChatMessage();
        msg.setMsg(message);
        msg.setFrom(ADMIN_ROLE);
        msg.setTo(to);
        msg.setRead(0);
        const sentTime = new Date().toLocaleString();
        msg.setTimestamp(sentTime);

        client.sendMsg(msg, {}, (err, response) => {
            console.log(`Sent message ${message}!`);
        });
    }

    const onTyping = (to) => {
        const msg = new ChatMessage();
        msg.setFrom(ADMIN_ROLE);
        msg.setTo(to);

        client.type(msg, {}, (err, response) => {
            console.log(`Admin typing response to user ${to}!`);
        });
    }

    const onMsgRead = (user, id) => {
        const msg = new ChatMessage();
        msg.setFrom(ADMIN_ROLE);
        msg.setTo(user);
        msg.setId(id);
        msg.setRead(1);

        client.readMsg(msg, {}, (err, response) => {
            console.log(`Admin read message with id: ${id}!`);
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
            }
        });
    }

    const onClick = (message) => {
        if (message.to === ADMIN_ROLE) {
            onMsgRead(message.from, message.id);
        }
    }

    const displayChatComponent = (user) =>
        <SimpleChatComponent
            user={user}
            isTyping={isTyping.find(u => u === user) !== undefined}
            messages={messages.filter(m => m.from === user || m.to === user)}
            onSendMessage={(message) => onSendMessage(message, user)}
            onShowCallback={() => getChatHistory(user)}
            onTyping={() => onTyping(user)}
            onClick={(message) => onClick(message)}
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