import {Button, Card, FormControl, InputGroup} from "react-bootstrap";
import React, {useState} from "react";
import {USERNAME} from "../common/auth/Authentication";

export const SimpleChatComponent = (props) => {
    const [show, setShow] = useState(false);
    const [draftMessage, setDraftMessage] = useState("");
    const username = sessionStorage.getItem(USERNAME);

    const formatDate = (date) => {
        const parsedDate = new Date(Date.parse(date));
        return parsedDate.getFullYear() + "-" + (parsedDate.getMonth() + 1) + "-" + parsedDate.getDay() + " " +
            parsedDate.getHours() + ":" + parsedDate.getMinutes() + ":" + parsedDate.getSeconds();
    }

    const displaySingleMessage = (msg) => {
        const detailsStyle = (msg.from === username ? "align-left" : "align-right") + " small-text";
        const messageStyle = msg.from === username ? "client-response" : "admin-response";

        return (
            <div className={messageStyle + " mt-2"} key={msg.id}>
                <p className={detailsStyle}>{msg.from}</p>
                <p>{msg.msg}</p>
                <p className={detailsStyle}>{formatDate(msg.time.toString())}</p>
            </div>
        )
    }

    return (
        show ?
            <Card className={"chat-container"}>
                <Card.Header onClick={() => setShow(!show)}>
                    <Card.Title>Chat with {props.user}</Card.Title>
                </Card.Header>
                <Card.Body className={"messages-container"}>
                    {props.messages.map(displaySingleMessage)}
                </Card.Body>
                <Card.Footer>
                    <InputGroup>
                        <FormControl type={"text"} onChange={e => setDraftMessage(e.target.value)}
                                     value={draftMessage}/>
                        <Button onClick={() => {
                            props.onSendMessage(draftMessage);
                            setDraftMessage("");
                        }}>Send</Button>
                    </InputGroup>
                </Card.Footer>
            </Card>
            :
            <Button onClick={() => setShow(!show)}>Chat with {props.user}</Button>
    )
}