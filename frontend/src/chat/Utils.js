export const mapMessage = (chatMessage) => {
    const id = chatMessage.getId();
    const from = chatMessage.getFrom();
    const to = chatMessage.getTo();
    const msg = chatMessage.getMsg();
    const timestamp = chatMessage.getTimestamp();
    const read = chatMessage.getRead();

    return {id: id, from: from, to: to, msg: msg, timestamp: timestamp, read: read};
}