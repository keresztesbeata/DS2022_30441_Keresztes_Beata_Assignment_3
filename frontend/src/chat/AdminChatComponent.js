import React, {useState} from 'react'
import {Button} from "react-bootstrap";
import {ChatServiceClient} from "./chat_grpc_web_pb";
import {USERNAME} from "../common/auth/Authentication";
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
    const {ChatMessage, ReceiveMsgRequest, Empty} = require('./chat_pb.js');
    const client = new ChatServiceClient(CHAT_SERVICE_URL, null, null);

    const mapMessage = (chatMessage) => {
        const from = chatMessage.getFrom();
        const to = chatMessage.getTo();
        const msg = chatMessage.getMsg();
        const datetime = chatMessage.getDatetime();
        const read = chatMessage.getRead();
        const sent = chatMessage.getSent();

        return {from: from, to: to, msg: msg, datetime: datetime, read: read, sent: sent};
    }

    const listenToMessages = (user) => {
        if (users.find(u => u === user)) {
            console.log(`Already subscribed to message stream of user ${user}`);
        } else {
            setUsers(prevState => [...prevState, user]);
            console.log(`Subscribing to message stream of user ${user}.`)

            const strRq = new ReceiveMsgRequest();
            strRq.setUser(user);
            strRq.setAdmin(1);

            let chatStream = client.receiveMsg(strRq, {});
            chatStream.on("data", (response) => {
                if (response.getSent() === 1) {
                    setMessages(prevState => [...prevState, mapMessage(response)]);
                    console.log(`Received message ${response.getMsg()} from ${response.getFrom()}`)
                } else if (response.getFrom() !== username) {
                    console.log(`User ${user} is typing`);
                    if (isTyping.find(u => u === user) === undefined) {
                        setIsTyping(prevState => [...prevState, user]);
                    }
                    setTimeout(function () {
                        const typing = isTyping.filter(u => u !== user);
                        setIsTyping(typing);
                    }, 1000);
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
    }

    const onJoin = () => {
        const user = new User();
        user.setName(username);

        let notificationStream = client.notifyAdmin(user, {});
        notificationStream.on("data", (response) => {
            const user = response.getName();
            // start listening to messages from the new user
            listenToMessages(user);
            console.log(`User ${user} has joined the chat!`);
        });

        setJoined(true);

        client.getAllClients(new Empty(), {}, (err, response) => {
            const usersList = response.getUsersList();
            usersList.forEach(u => {
                listenToMessages(u.getName());
            });
            console.log("Retrieved clients: " + users);
        });
    }

    const onSendMessage = (message, to) => {
        const msg = new ChatMessage();
        msg.setMsg(message);
        msg.setFrom(username);
        msg.setTo(to);
        msg.setRead(0);
        msg.setSent(1);
        const sentTime = new Date().toLocaleString();
        msg.setDatetime(sentTime);

        client.sendMsg(msg, null, (err, response) => {
            console.log(`Sent message ${message}!`);
        });
    }

    const onTyping = (to) => {
        const msg = new ChatMessage();
        msg.setMsg("...");
        msg.setFrom(username);
        msg.setTo(to);
        msg.setRead(0);
        msg.setSent(0);
        const sentTime = new Date().toLocaleString();
        msg.setDatetime(sentTime);

        client.sendMsg(msg, null, (err, response) => {
            console.log(`Admin typing response to user ${to}!`);
        });
    }

    const getChatHistory = (user) => {
        let req = new User();
        req.setName(user);
        client.getHistory(req, {}, (err, response) => {
            console.log(`Retrieved chat history for user ${user}: ${response.getHistoryList().length} messages`);
            const history = messages.filter(msg => msg.from !== user || msg.to !== user);
            setMessages(history);
            response.getHistoryList().forEach(msg => setMessages(prevState => [...prevState, mapMessage(msg)]));
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