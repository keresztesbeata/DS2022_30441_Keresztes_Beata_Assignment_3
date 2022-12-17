import React, {useState} from 'react'
import {Button, Card, FormControl, InputGroup} from "react-bootstrap";
import {USERNAME} from "../common/auth/Authentication";

export const JOINED = "joined_chat"

export const ChatComponent = () => {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState(null)
    const [joined, setJoined] = useState(() => sessionStorage.getItem(JOINED) !== null)
    const username = sessionStorage.getItem(USERNAME)

    const onJoin = () => {
        const joined_user = sessionStorage.getItem(JOINED)
        if (joined_user !== null && joined_user === username) {
            console.log(`You were already joined in the chat using the name ${joined_user}!`)
        } else {
            sessionStorage.setItem(JOINED, username)
            setJoined(true)
            console.log(`You have joined the chat using the name ${username}!`)
        }
    }

    const onSend = () => {
        const i = messages.length
        console.log(`Sent message ${newMessage}!`)
        messages.push({text: newMessage, time: new Date(), sender: i % 2 === 0 ? username : "admin"})
        setNewMessage("")
    }

    const formatDate = (date) => {
        const parsedDate = new Date(Date.parse(date));
        return parsedDate.getFullYear() + "-" + (parsedDate.getMonth() + 1) + "-" + parsedDate.getDay() + " " +
            parsedDate.getHours() + ":" + parsedDate.getMinutes() + ":" + parsedDate.getSeconds();
    }

    const displaySingleMessage = (msg) => {
        const detailsStyle = (msg.sender === username ? "align-left" : "align-right") + " small-text";
        const messageStyle = msg.sender === username ? "client-response" : "admin-response";

        return (
            <div>
                <p className={detailsStyle}>{msg.sender}</p>
                <p className={messageStyle}>{msg.text}</p>
                <p className={detailsStyle}>{formatDate(msg.time.toString())}</p>
            </div>
        )
    }
    return (
        joined ?
            <Card className={"chat-container"}>
                <Card.Header>
                    Chat
                </Card.Header>
                <Card.Body className={"messages-container"}>
                    {messages.map(displaySingleMessage)}
                </Card.Body>
                <Card.Footer>
                    <InputGroup>
                        <FormControl type={"text"} onChange={e => setNewMessage(e.target.value)} value={newMessage}/>
                        <Button onClick={onSend}>Send</Button>
                    </InputGroup>
                </Card.Footer>
            </Card>
            :
            <Button onClick={onJoin}>Join Chat</Button>
    )

}