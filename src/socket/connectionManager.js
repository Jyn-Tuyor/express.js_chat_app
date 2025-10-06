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
        if (data.broadcast == "private") {
            this.connectionMode = "private"
        } else {
            this.connectionMode = "public"
        }
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

    async broadcastPrivateChat(data) {
        // this.connectionMode = "private"
        const targetSocket = this.clients.get(data.receiver);

        if (targetSocket && targetSocket.readyState == WebSocket.OPEN) {

            targetSocket.send(JSON.stringify({
                "type": "chat",
                "broadcast": "private",
                "from": this.client_ws.user,
                "message": data.message.length >= 48 ? data.message.slice(0, 48) : data.message,

            }))

            // console.log("sended")

            await Chat.create({
                "sender_id": this.client_ws.user.id,
                "receiver_id": data.receiver,
                "message": data.message.length >= 48 ? data.message.slice(0, 48) : data.message,
                "broadcast": 'private',
                "type": "chat"
            })
        } else {
            // fallback: persist private chat to DB if possible
            if (this.client_ws.user && this.client_ws.user.id) {
                await Chat.create({
                    sender_id: this.client_ws.user.id,
                    receiver_id: data.receiver,
                    message: data.message.length >= 48 ? data.message.slice(0, 48) : data.message,
                    broadcast: 'private',
                    type: 'chat'
                });
            }
        }

    }
}

module.exports = ConnectionManager;