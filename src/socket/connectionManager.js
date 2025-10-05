class ConnectionManager {
    constructor(wss, WsServer) {
        this.clients = new Map();
        this.WsServer = WsServer
        this.wss = wss;
    }

    addClient(id, ws) {
        this.clients.set(id, ws);
    }

    // broadcastPublicAlert(message) {
    //     this.wss.clients.forEach((client) => {
    //         if (client.readyState === this.WsServer.OPEN) {
    //             // msg = msg.toString();
    //             client.send(JSON.stringify({
    //                 type: 'join',
    //                 message: `${message.user.username} joined the chat.`
    //             }))
    //         }
    //     })

    // }

    broadcastPublicChat(message) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === this.WsServer.OPEN) {
                client.send(JSON.stringify({
                    type: 'chat',
                    data: {
                        user: message.user,
                        message: message.message.length >= 48 ? message.message.slice(0, 48): message.message
                    }
                }))
            }
        })
    }

}

module.exports = ConnectionManager;