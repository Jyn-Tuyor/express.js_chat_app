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

            client_socket.on('message', (msg) => {
                wss.clients.forEach((client) => {
                    if (client.readyState === WsServer.OPEN) {
                        msg = msg.toString();
                        client.send(`${msg}`)
                    }
                })
            })

        } catch (err) {
            console.log(`Error processing data: ${err}`)
        }

        client_socket.on("close", (code, reason) => {
            console.log(`A client disconnected, Code - ${code}, Reason - ${reason}`)
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