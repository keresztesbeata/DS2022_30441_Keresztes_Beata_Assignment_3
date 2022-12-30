import {Button, Card, FormControl, InputGroup} from "react-bootstrap";
import React, {useState} from "react";
import {ADMIN_ROLE} from "../common/auth/Authentication";
import {BsCheck, BsCheck2All} from "react-icons/bs";

export const SimpleChatComponent = (props) => {
    const [show, setShow] = useState(false);
    const [draftMessage, setDraftMessage] = useState("");

    const formatDate = (date) => {
        const parsedDate = new Date(Date.parse(date));
        return parsedDate.getFullYear() + "-" + (parsedDate.getMonth() + 1) + "-" + parsedDate.getDay() + " " +
            parsedDate.getHours() + ":" + parsedDate.getMinutes() + ":" + parsedDate.getSeconds();
    }

    const displaySingleMessage = (message) => {
        const detailsStyle = "align-right small-text";
        const messageStyle = message.from === ADMIN_ROLE ? "response-from" : "response-to";

        return (
            <div className={messageStyle + " mt-2"} onClick={(e) => props.onClick(message)}>
                <p className={detailsStyle}>{message.from}</p>
                <p>{message.msg}</p>
                <p className={detailsStyle}>{formatDate(message.timestamp.toString())}</p>
                {message.read === 1 ? <BsCheck2All/> : <BsCheck/>}
            </div>
        )
    }

    const onToggleShow = () => {
        const visible = show;
        setShow(!visible);
        if (visible === false) {
            props.onShowCallback();
        }
    }

    return (
        show ?
            <Card className={"chat-container"}>
                <Card.Header onClick={(e) => onToggleShow()}>
                    <Card.Title>Chat with {props.user}</Card.Title>
                </Card.Header>
                <Card.Body className={"messages-container"}>
                    <div>
                        {props.messages.map(m => displaySingleMessage(m))}
                        <p>{props.isTyping ? `${props.user} is typing...` : ''}</p>
                    </div>
                </Card.Body>
                <Card.Footer>
                    <InputGroup>
                        <FormControl type={"text"} onChange={e => {
                            setDraftMessage(e.target.value);
                            props.onTyping();
                        }}
                                     value={draftMessage}/>
                        <Button onClick={(e) => {
                            props.onSendMessage(draftMessage);
                            setDraftMessage("");
                        }}>Send</Button>
                    </InputGroup>
                </Card.Footer>
            </Card>
            :
            <Button onClick={(e) => onToggleShow()}>Chat with {props.user}</Button>
    )
}