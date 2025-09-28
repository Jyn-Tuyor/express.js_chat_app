const WsServer = require("ws")
const Chat = require("../models/Chat")
const User = require("../models/User")


const socketInit = (server) => {
    const wss = new WsServer.Server({ server, clientTracking: true })
    wss.on("connection", (client_socket) => {
        try {
            client_socket.isAlive = true;

            client_socket.on('pong', () => {
                console.log("Received a pong.")
                client_socket.isAlive = true
            })

            client_socket.on('message', async(raw) => {

                const message = JSON.parse(raw.toString())


                if (message.type == 'join') {
                    client_socket.user = message.user
                    // client_socket.id = message.id

                    wss.clients.forEach((client) => {
                        if (client.readyState === WsServer.OPEN) {
                            // msg = msg.toString();
                            client.send(JSON.stringify({
                                type: 'join',
                                message: `${message.user.username} joined the chat.`
                            }))
                        }
                    })
                } else if (message.type == 'chat') {
                    console.log(message)

                    // store the chat to db
                    await Chat.create({
                        "sender_id": client_socket.user.id,
                        "message": message.message,
                        "type": 'global'
                    })

                    wss.clients.forEach((client) => {
                        if (client.readyState === WsServer.OPEN) {
                            client.send(JSON.stringify({
                                type: 'chat',
                                message: `${message.user}: ${message.message}`
                            }))
                        }
                    })
                }



            })

        } catch (err) {
            console.log(`Error processing data: ${err}`)
        }

        client_socket.on("close", (code, reason) => {
            console.log(`A client disconnected, Code - ${code}, Reason - ${reason}`)

            wss.clients.forEach((client) => {
                if (client.readyState === WsServer.OPEN) {
                    client.send(JSON.stringify({
                        type: 'left',
                        message:`${client_socket.user.username} left the chat.`
                    }))
                }
            })


            wss.clients.delete(client_socket);
        })

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


    })

}

module.exports = socketInit