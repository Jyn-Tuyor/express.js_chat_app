const WsServer = require("ws")
const Chat = require("../models/Chat")
const User = require("../models/User")


const clients = new Map();
let connectType;

const socketInit = (server) => {
    const wss = new WsServer.Server({ server, clientTracking: true })
    wss.on("connection", (client_socket) => {
        try {
            client_socket.isAlive = true;
            client_socket.on('pong', () => {
                console.log("Received a pong.")
                client_socket.isAlive = true
            })

            client_socket.on('message', async (raw) => {
                const message = JSON.parse(raw.toString())
                // client_socket.user = message.user

                // console.log("user is " + client_socket.user)

                // clients.set(client_socket.user.id, client_socket);


                if (message.type == 'join' && message.broadcast == 'public') {
                    client_socket.user = message.user

                    console.log("user is " + client_socket.user)

                    clients.set(client_socket.user.id, client_socket);
                    // client_socket.id = message.id
                    connectType = "public"

                    await Chat.create({
                        "sender_id": client_socket.user.id,
                        "message": `${client_socket.user.username} joined the chat`,
                        "broadcast": 'global',
                        "type": "join"
                    })

                    wss.clients.forEach((client) => {
                        if (client.readyState === WsServer.OPEN) {
                            // msg = msg.toString();
                            client.send(JSON.stringify({
                                type: 'join',
                                message: `${message.user.username} joined the chat.`
                            }))
                        }
                    })
                } else if (message.type == 'chat' && message.broadcast == 'public') {
                    console.log(message)
                    connectType = "public"
                    // store the chat to db
                    await Chat.create({
                        "sender_id": client_socket.user.id,
                        "message": message.message,
                        "broadcast": 'global',
                        "type": "chat"
                    })

                    wss.clients.forEach((client) => {
                        if (client.readyState === WsServer.OPEN) {
                            client.send(JSON.stringify({
                                type: 'chat',
                                message: `${message.user}: ${message.message}`
                            }))
                        }
                    })
                } else if (message.type == 'join' && message.broadcast == 'private') {
                    
                    client_socket.user = message.user
                    console.log("user is " + client_socket.user)
                    clients.set(client_socket.user.id, client_socket);
                    connectType = "private"


                } else if (message.type == 'chat' && message.broadcast == 'private') {
                    connectType = "private"
                    // console.log(message)
                    const targetSocket = clients.get(message.receiver);
                    // console.log(targetSocket)
                    // const from = JSON.parse(message.from)
                    // console.log("from: ", from)

                    console.log(targetSocket)


                    if (targetSocket && targetSocket.readyState == WebSocket.OPEN) {

                        targetSocket.send(JSON.stringify({
                            "type": "chat",
                            "broadcast": "private",
                            // "from": from,
                            "message": message.message
                        }))

                        console.log("sended")

                        // await Chat.create({
                        //     "sender_id": client_socket.user.id,
                        //     "message": message.message,
                        //     "broadcast": 'global',
                        //     "type": "chat"
                        // })
                    } else {
                        // console.log("socket id: " + client_socket.user.id)
                        await Chat.create({
                            "sender_id": client_socket.user.id,
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

        client_socket.on("error", (error) => {
            console.log(`Websocket error: ${error}`)
        })

        // Keep alive system
        // will ping every 30 seconds
        const interval = setInterval(() => {
            wss.clients.forEach((client) => {
                if (client.isAlive == false) {
                    // client.ping();
                    console.log("Terminating unresponsive client.")
                    return client.terminate()
                }

                client.isAlive = true;
                client.ping();
                console.log("Ping sent")

            })


        }, 30000)


        client_socket.on("close", async (code, reason) => {
            console.log(`A client disconnected, Code - ${code}, Reason - ${reason}`)

            // await Chat.create({
            //     "sender_id": client_socket.user.id,
            //     "message": `${client_socket.user.username} left the chat`,
            //     "broadcast": 'global',
            //     "type": "left"
            // })
            if (connectType == "public ") {
                wss.clients.forEach((client) => {
                    if (client.readyState === WsServer.OPEN) {
                        client.send(JSON.stringify({
                            type: 'left',
                            message: `${client_socket.user.username} left the chat.`
                        }))
                    }
                })
            }

            clearInterval(interval)
            wss.clients.delete(client_socket);
        })

    })

}

module.exports = socketInit