import React, {useState} from 'react'
import {Button} from "react-bootstrap";
import {ADMIN_ROLE, USERNAME} from "../common/auth/Authentication";
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
    const {ChatMessage, ReceiveMsgRequest, LeaveRequest} = require('./chat_pb.js');

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

    const listenToMessages = () => {
        const strRq = new ReceiveMsgRequest();
        strRq.setUser(username);
        strRq.setAdmin(0);

        let chatStream = client.receiveMsg(strRq, {});
        chatStream.on("data", (response) => {
            if (response.getSent() === 1) {
                setMessages(prevState => [...prevState, mapMessage(response)]);
                console.log(`Received message ${response.getMsg()} from ${response.getFrom()}`);
            } else if (response.getFrom() !== username) {
                console.log('Admin is typing!');
                setIsTyping(true);
                setTimeout(function () {
                    setIsTyping(false);
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
            });
    }

    const onSendMessage = (message) => {
        const msg = new ChatMessage();
        msg.setMsg(message);
        msg.setFrom(username);
        msg.setTo(ADMIN_ROLE);
        msg.setRead(0);
        msg.setSent(1);
        const sentTime = new Date().toLocaleString();
        msg.setDatetime(sentTime);

        client.sendMsg(msg, null, (err, response) => {
            console.log(`Sent message ${message}!`);
        });
    }

    const onTyping = () => {
        const msg = new ChatMessage();
        msg.setMsg("...");
        msg.setFrom(username);
        msg.setTo(ADMIN_ROLE);
        msg.setRead(0);
        msg.setSent(0);
        const sentTime = new Date().toLocaleString();
        msg.setDatetime(sentTime);

        client.sendMsg(msg, null, (err, response) => {
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
            response.getHistoryList().forEach(msg => setMessages(prevState => [...prevState, mapMessage(msg)]));
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