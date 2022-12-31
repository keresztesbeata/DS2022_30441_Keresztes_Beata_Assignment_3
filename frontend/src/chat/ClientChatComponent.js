import React, {useState} from 'react'
import {Button} from "react-bootstrap";
import {ADMIN_ROLE, CLIENT_ROLE, USERNAME} from "../common/auth/Authentication";
import {SimpleChatComponent} from "./SimpleChatComponent";
import {mapMessage} from "./Utils";
import {getGrpcAddress} from "../common/Utils";

const JOINED = "joined_chat";

export const ClientChatComponent = () => {
    const [isTyping, setIsTyping] = useState(false);
    const [joined, setJoined] = useState(() => sessionStorage.getItem(JOINED) !== null);
    const [messages, setMessages] = useState([]);
    const username = sessionStorage.getItem(USERNAME);

    const {ChatServiceClient} = require("./chat_grpc_web_pb");
    const {ChatMessage, User} = require('./chat_pb.js');

    const client = new ChatServiceClient(getGrpcAddress(), null, null);

    const onMsgRead = (id) => {
        const msg = new ChatMessage();
        msg.setFrom(username);
        msg.setTo(ADMIN_ROLE);
        msg.setId(id);
        msg.setRead(1);

        client.readMsg(msg, null, (err, response) => {
            console.log(`Read message with id: ${id}!`);
        });
    }

    const onTypingNotification = (response) => {
        if (response.getFrom() === ADMIN_ROLE) {
            console.log(`Admin is typing`);
            setIsTyping(true);
            setTimeout(function () {
                setIsTyping(false);
            }, 1000);
        }
    }

    const onMsgReceivedNotification = (response) => {
        if (response.getTo() === username) {
            onMsgRead(response.getId());
        }else{
            setMessages(prevState => [...prevState, mapMessage(response)]);
        }
        console.log(`Received message ${response.getMsg()} from ${response.getFrom()}`);
    }

    const subscribeToNotifications = async () => {
        const strRq = new User();
        strRq.setName(username);
        strRq.setRole(CLIENT_ROLE);

        let chatStream = await client.receiveMsg(strRq, null);
        chatStream.on("data", (response) => {
            if (response.getType() === 1) {
                onMsgReceivedNotification(response);
            } else if (response.getType() === 2) {
                onTypingNotification(response);
            } else if (response.getType() === 3) {
                getChatHistory();
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
                subscribeToNotifications()
                    .then(() => {
                        console.log(`Subscribed to message stream of admin.`);
                    });
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
        const msg = new ChatMessage();
        msg.setFrom(username);
        msg.setTo(ADMIN_ROLE);

        client.type(msg, {}, (err, response) => {
            console.log(`User ${username} typing response to admin!`);
        });
    }

    // const onLeaveChat = () => {
    //     if (sessionStorage.getItem(JOINED) === undefined) {
    //         console.log('You have already left the chat!');
    //         return;
    //     }
    //     const request = new LeaveRequest();
    //     request.setUser(username);
    //     client.leave(request, null, () => {
    //     });
    //     sessionStorage.removeItem(JOINED);
    //     setJoined(false);
    // }

    const getChatHistory = () => {
        let req = new User();
        req.setName(username);
        client.getHistory(req, {}, (err, response) => {
            console.log(`Retrieved chat history for user ${username}: ${response.getHistoryList().length} messages`);
            const historyList = response.getHistoryList().map(m => {
                if(m.getTo() === username && m.getRead() === 0) {
                    m.setRead(1);
                    onMsgRead(m.getFrom(), m.getId());
                }
                return mapMessage(m);
            });
            setMessages(historyList);
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