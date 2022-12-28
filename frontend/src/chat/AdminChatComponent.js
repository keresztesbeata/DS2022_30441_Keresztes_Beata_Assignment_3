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
    const username = sessionStorage.getItem(USERNAME);

    const {User} = require("./chat_pb");
    const {ChatServiceClient} = require("./chat_grpc_web_pb");
    const {ChatMessage, ReceiveMsgRequest, Empty} = require('./chat_pb.js');
    const client = new ChatServiceClient(CHAT_SERVICE_URL, null, null);

    const listenToMessages = (user) => {
        const strRq = new ReceiveMsgRequest();
        strRq.setUser(user);
        strRq.setAdmin(1);

        let chatStream = client.receiveMsg(strRq, {});
        chatStream.on("data", (response) => {
            const from = response.getFrom();
            const to = response.getTo();
            const msg = response.getMsg();
            const time = response.getTime();

            setMessages(prevState => [...prevState,
                {from: from, to: to, msg: msg, time: time}]);

            if (from !== username) {
                console.log(`Received message ${msg} from ${from}`)
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

    const onJoin = () => {
        const user = new User();
        user.setName(username);

        let notificationStream = client.notifyAdmin(user, {});
        notificationStream.on("data", (response) => {
            const user = response.getName();
            setUsers(prevState => [...prevState, user]);
            console.log(`User ${user} has joined the chat!`);
            // start listening to messages from the new user
            listenToMessages(user);
        });

        client.getAllClients(new Empty(), null, (err, response) => {
            const users = response.array[0];
            if (users.length > 0) {
                console.log(users)
                setUsers(users.map(usersList => usersList[0]));
            } else {
                setUsers([]);
            }
            setJoined(true);
        });
    }

    const onSendMessage = (message, to) => {
        const msg = new ChatMessage();
        msg.setMsg(message);
        msg.setFrom(username);
        msg.setTo(to);
        const sentTime = new Date().toLocaleString();
        msg.setTime(sentTime);

        client.sendMsg(msg, null, (err, response) => {
            console.log(response);
            console.log(`Sent message ${message}!`);
        });
    }

    const displayChatComponent = (user) =>
        <SimpleChatComponent
            user={user}
            messages={messages.filter(m => m.from === user || m.to === user)}
            onSendMessage={(message) => onSendMessage(message, user)}/>;

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