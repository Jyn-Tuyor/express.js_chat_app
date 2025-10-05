const Chat = require('../models/Chat')

class ConnectionManager {
    constructor(wss, WsServer, client_ws) {
        this.clients = new Map();
        this.WsServer = WsServer
        this.wss = wss;
        this.connectionMode;
        this.client_ws = client_ws;
    }

    addClient(data, ws) {
        this.client_ws.user = data.user

        this.clients.set(data.user.id, ws);
    }

    broadcastPublicAlert(data, client_ws) {
        // this.addClient(client_ws.user.id, client_ws)
        this.connectionMode = "public"

        // await Chat.create({
        //     "sender_id": client_ws.user.id,
        //     "message": `${client_ws.user.username} joined the chat`,
        //     "broadcast": 'global',
        //     "type": "join"
        // })


        this.wss.clients.forEach((client) => {
            if (client.readyState === this.WsServer.OPEN) {
                // msg = msg.toString();
                client.send(JSON.stringify({
                    type: 'join',
                    message: `${data.user.username} joined the chat.`
                }))
            }
        })

    }

    async broadcastPublicChat(data) {
        this.connectionMode = "public"

        await Chat.create({
            "sender_id": this.client_ws.user.id,
            "message": data.message.length >= 48 ? data.message.slice(0, 48) : data.message,
            "broadcast": 'global',
            "type": "chat"
        })

        this.wss.clients.forEach((client) => {
            if (client.readyState === this.WsServer.OPEN) {
                client.send(JSON.stringify({
                    type: 'chat',
                    data: {
                        user: data.user,
                        message: data.message.length >= 48 ? data.message.slice(0, 48) : data.message
                    }
                }))
            }
        })
    }

}

module.exports = ConnectionManager;