const WsServer = require("ws")
const Chat = require("../models/Chat")
const ConnectionManager = require("./connectionManager");

const socketInit = (server) => {
    const wss = new WsServer.Server({ server, clientTracking: true });
    const connectionManager = new ConnectionManager(wss, WsServer);

    wss.on("connection", (client_ws) => {
        try {

            client_ws.isAlive = true;
            client_ws.on('pong', () => {
                // mark client as alive when we receive a pong
                client_ws.isAlive = true;
            });

            client_ws.on('message', async (raw) => {
                try {
                    const data = JSON.parse(raw.toString());

                    if (data.type == 'join' && data.broadcast == 'public') {
                        connectionManager.addClient(data, client_ws);
                    } else if (data.type == 'chat' && data.broadcast == 'public') {
                        connectionManager.broadcastPublicChat(data), client_ws;
                    } else if (data.type == 'join' && data.broadcast == 'private'){
                        connectionManager.addClient(data, client_ws)
                    } else if (data.type == 'chat' && data.broadcast == 'private') {
                        connectionManager.broadcastPrivateChat(data, client_ws);
                    }
                } catch (err) {
                    console.log('Error handling message:', err);
                }
            });

            client_ws.on('error', (error) => {
                console.log(`Websocket error: ${error}`);
            });

            client_ws.on('close', async (code, reason) => {
                console.log(`A client disconnected, Code - ${code}, Reason - ${reason}`);
                // nothing else to do here; wss will remove the client automatically
            });

        } catch (err) {
            console.log(`Error processing connection: ${err}`);
        }
    });

    // Keep alive system: ping clients every 30 seconds and terminate unresponsive ones
    const interval = setInterval(() => {
        wss.clients.forEach((client) => {
            if (client.isAlive === false) {
                console.log('Terminating unresponsive client.');
                return client.terminate();
            }

            client.isAlive = false;
            client.ping();
        });
    }, 30000);

    wss.on('close', () => clearInterval(interval));
};

module.exports = socketInit;