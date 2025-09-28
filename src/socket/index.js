const WsServer = require("ws")

const socketInit = (server) => {
    const wss = new WsServer.Server({ server, clientTracking: true })
    wss.on("connection", (client_socket) => {
        try {
            client_socket.isAlive = true;

            client_socket.on('pong', () => {
                console.log("Received a pong.")
                client_socket.isAlive = true
            })

            client_socket.on('message', (raw) => {

                const message = JSON.parse(raw.toString())


                if (message.type == 'join') {
                    client_socket.user = message.user

                    wss.clients.forEach((client) => {
                        if (client.readyState === WsServer.OPEN) {
                            // msg = msg.toString();
                            client.send(JSON.stringify({
                                type: 'join',
                                message: `${message.user} joined the chat.`
                            }))
                        }
                    })
                } else if (message.type == 'chat') {
                    console.log(message)
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
                    client.send(`${client_socket.user} left the chat.`)
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