class ConnectionManager {
    constructor(wss) {
        this.clients = new Map();
        this.wss = wss;
    }

    addClient(id, ws) {
        this.clients.set(id, ws);
    }

    broadcastChat(message) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WsServer.OPEN) {
                client.send(JSON.stringify({
                    type: 'chat',
                    message: `${message.user}: ${message.message}`
                }))
            }
        })
    }


}

module.exports = ConnectionManager;