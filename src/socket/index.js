const WsServer = require("ws")
const Chat = require("../models/Chat")
// const User = require("../models/User")
const ConnectionManager = require("./connectionManager")


const clients = new Map();
let connectType;

const socketInit = (server) => {
    const wss = new WsServer.Server({ server, clientTracking: true })
    const connectionManager = new ConnectionManager(wss, WsServer);
    

    wss.on("connection", (client_ws) => {
        try {
            client_ws.isAlive = true;
            client_ws.on('pong', () => {
                console.log("Received a pong.")
                client_ws.isAlive = true
            })

            client_ws.on('message', async (raw) => {
                const message = JSON.parse(raw.toString())

                if (message.type == 'join' && message.broadcast == 'public') {
                    client_ws.user = message.user

                    connectionManager.addClient(client_ws.user.id, client_ws)
                    connectType = "public"

                    // await Chat.create({
                    //     "sender_id": client_ws.user.id,
                    //     "message": `${client_ws.user.username} joined the chat`,
                    //     "broadcast": 'global',
                    //     "type": "join"
                    // })

                    
                    // connectionManager.broadcastPublicAlert(message);


                } else if (message.type == 'chat' && message.broadcast == 'public') {
                    connectType = "public"
                    console.log(message)
                    await Chat.create({
                        "sender_id": client_ws.user.id,
                        "message": message.message,
                        "broadcast": 'global',
                        "type": "chat"
                    })

                    connectionManager.broadcastPublicChat(message);

                } else if (message.type == 'join' && message.broadcast == 'private') {
                    
                    client_ws.user = message.user
                    clients.set(client_ws.user.id, client_ws);
                    connectType = "private"


                } else if (message.type == 'chat' && message.broadcast == 'private') {
                    connectType = "private"
                    const targetSocket = clients.get(message.receiver);

                    if (targetSocket && targetSocket.readyState == WebSocket.OPEN) {

                        targetSocket.send(JSON.stringify({
                            "type": "chat",
                            "broadcast": "private",
                            "from": client_ws.user,
                            "message": message.message
                        }))

                        console.log("sended")

                        await Chat.create({
                            "sender_id": client_ws.user.id,
                            "receiver_id": message.receiver,
                            "message": message.message,
                            "broadcast": 'private',
                            "type": "chat"
                        })
                    } else {
                        // console.log("socket id: " + client_ws.user.id)
                        await Chat.create({
                            "sender_id": client_ws.user.id,
                            "receiver_id": message.receiver,
                            "message": message.message,
                            "broadcast": 'private',
                            "type": "chat"
                        })
                    }


                }

            })

        } catch (err) {
            console.log(`Error processing data: ${err}`)
        }

        client_ws.on("error", (error) => {
            console.log(`Websocket error: ${error}`)
        })

        // Keep alive system
        // will ping every 30 seconds
        const interval = setInterval(() => {
            wss.clients.forEach((client) => {
                if (client.isAlive == false) {
                    console.log("Terminating unresponsive client.")
                    return client.terminate()
                }

                client.isAlive = true;
                client.ping();
                console.log("Ping sent")

            })


        }, 30000)


        client_ws.on("close", async (code, reason) => {
            console.log(`A client disconnected, Code - ${code}, Reason - ${reason}`)

            if ( connectType == "public ") {
                // wss.clients.forEach((client) => {
                //     if (client.readyState === WsServer.OPEN) {
                //         client.send(JSON.stringify({
                //             type: 'left',
                //             message: `${client_ws.user.username} left the chat.`
                //         }))
                //     }
                // })
            }

            clearInterval(interval)
            wss.clients.delete(client_ws);
        })

    })

}

module.exports = socketInit