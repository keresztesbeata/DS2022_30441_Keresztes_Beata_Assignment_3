import React, {useState} from 'react'
import {Button} from "react-bootstrap";
import {ADMIN_ROLE, CLIENT_ROLE, USERNAME} from "../common/auth/Authentication";
import {ChatServiceClient} from "./chat_grpc_web_pb";
import {SimpleChatComponent} from "./SimpleChatComponent";

const CHAT_SERVICE_URL = "http://localhost:8081";
export const JOINED = "joined_chat";

export const ClientChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [joined, setJoined] = useState(() => sessionStorage.getItem(JOINED) !== null);
    const username = sessionStorage.getItem(USERNAME);

    const {User} = require("./chat_pb");
    const {ChatServiceClient} = require("./chat_grpc_web_pb");
    const {
        ChatMessage,
        LeaveRequest,
        MsgReadNotification
    } = require('./chat_pb.js');

    const client = new ChatServiceClient(CHAT_SERVICE_URL, null, null);

    const mapMessage = (chatMessage) => {
        const from = chatMessage.getFrom();
        const to = chatMessage.getTo();
        const msg = chatMessage.getMsg();
        const timestamp = chatMessage.getTimestamp();
        const read = chatMessage.getRead();

        return {from: from, to: to, msg: msg, timestamp: timestamp, read: read};
    }


    const onMsgRead = (ids) => {
        const msgReadNotification = new MsgReadNotification();
        msgReadNotification.setUser(username);
        msgReadNotification.setIdsList(ids);

        client.readMsg(msgReadNotification, null, (err, response) => {
            console.log(`Admin read message with ids: ${ids}!`);
        });
    }

    const listenToMessages = () => {
        const strRq = new User();
        strRq.setName(username);
        strRq.setRole(CLIENT_ROLE);

        let chatStream = client.receiveMsg(strRq, null);
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
        const strRq = new User();
        strRq.setName(username);
        strRq.setRole(CLIENT_ROLE);

        let readMsgStream = client.receiveReadMsgNotification(strRq, null);
        readMsgStream.on("data", (response) => {
            const userRead = response.getUser();
            if(userRead !== username) {
                const idsList = response.getIdsList();
                console.log("Admin has read messages with ids: ", idsList);
                const readMessages = messages.map(m => idsList.includes(m.id) ? {m, read: 1} : m);
                setMessages(readMessages);
                console.log(`Admin ${userRead} read ${idsList.length} messages!`);
            }
        });

        readMsgStream.on("status", function (status) {
            console.log(status.code, status.details, status.metadata);
        });

        readMsgStream.on("end", () => {
            console.log("Stream ended.");
            readMsgStream.cancel();
        });
        console.log(`Subscribed to message read notification stream of admin.`);
    }

    const listenToTypingNotifications = () => {
        const strRq = new User();
        strRq.setName(username);
        strRq.setRole(CLIENT_ROLE);

        let typeNotificationStream = client.receiveTypeNotification(strRq, null);
        typeNotificationStream.on("data", (response) => {
            console.log(response)
            if (response.getRole() === ADMIN_ROLE) {
                console.log(`Admin is typing`);
                setIsTyping(true);
                setTimeout(function () {
                    setIsTyping(false);
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
        console.log(`Subscribed to typing notification stream of admin.`)
    }

    const onJoin = () => {
        const user = new User();
        user.setName(username);

        client.join(
            user,
            null,
            (err, response) => {
                if (err) {
                    console.log(err);
                    return 1;
                }
                const error = response.getError();
                console.log('Error:' + error);
                const msg = response.getMsg();
                if (error === 1) {
                    console.log('Message:' + msg);
                }
                sessionStorage.setItem(JOINED, username);
                setJoined(true);
                console.log(`You have joined the chat using the name ${username}!`);
                // start listening to incoming messages
                listenToMessages();
                listenToMsgReadNotifications();
                listenToTypingNotifications();
            });
    }

    const onSendMessage = (message) => {
        const msg = new ChatMessage();
        msg.setMsg(message);
        msg.setFrom(username);
        msg.setTo(ADMIN_ROLE);
        msg.setRead(0);
        const sentTime = new Date().toLocaleString();
        msg.setTimestamp(sentTime);

        client.sendMsg(msg, {}, (err, response) => {
            console.log(`Sent message ${message}!`);
        });
    }

    const onTyping = () => {
        const user = new User();
        user.setName(username);
        user.setRole(CLIENT_ROLE);

        client.type(user, {}, (err, response) => {
            console.log(`User ${username} typing response to admin!`);
        });
    }

    const onLeaveChat = () => {
        if (sessionStorage.getItem(JOINED) === undefined) {
            console.log('You have already left the chat!');
            return;
        }
        const request = new LeaveRequest();
        request.setUser(username);
        client.leave(request, null, () => {
        });
        sessionStorage.removeItem(JOINED);
        setJoined(false);
    }

    const getChatHistory = () => {
        let req = new User();
        req.setName(username);
        client.getHistory(req, {}, (err, response) => {
            console.log(`Retrieved chat history for user ${username}: ${response.getHistoryList().length} messages`);
            const history = messages.filter(msg => msg.from !== username || msg.to !== username);
            setMessages(history);
            const historyList = response.getHistoryList();
            if (historyList.length > 0) {
                historyList.forEach(msg => {
                    setMessages(prevState => [...prevState, mapMessage(msg)]);
                });
                const ids = historyList.filter(msg => msg.getFrom() !== username).map(msg => msg.getId());
                if (ids.length > 0) {
                    onMsgRead(ids);
                }
            }
        });
    }

    return (
        joined ?
            <SimpleChatComponent
                user={"Admin"}
                messages={messages}
                isTyping={isTyping}
                onSendMessage={onSendMessage}
                onShowCallback={getChatHistory}
                onTyping={onTyping}
            />
            :
            <Button onClick={onJoin}>Join Chat</Button>
    )

}