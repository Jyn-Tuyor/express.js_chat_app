const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const WsServer = require("ws")
const http = require("http")
const path = require('path')
const session = require("express-session")
const sequelize = require("./db")
const auth = require("./middleware/auth")


// Initialize tables
require("./models/User")
require("./models/UserProfile")


// sequelize.sync({ force: false });
const dotenv = require("dotenv")
dotenv.config()

const PORT = 7878;
const app = express();

// sequelize.drop().then(() => {
//     console.log("db dropped")
// })

sequelize.sync()
    .then(() => console.log("Connected to db"))


// set view engine
app.use(expressLayouts)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');


// middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, '/public')))


// session-setup
app.use(session({
    secret: "dfgoqwoiqj",
    resave: false,
    saveUninitialized: false
}))


// Web socket   
const server = http.createServer(app)
const wss = new WsServer.Server({ server, clientTracking: true })


wss.on("connection", (client_socket, request) => {

    try {
        client_socket.isAlive = true;

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
})


// routes
app.use('/', require('./routes/authRoutes'));

// protected route
const protectedRoutes = express.Router();
protectedRoutes.use(auth);


protectedRoutes.use("/", require("./routes/userRoutes"))

protectedRoutes.get("/dashboard", (req, res) => {
    const user = req.session.user;
    res.render("dashboard", { user })
})

// mounting the protected routes
app.use("/users", protectedRoutes);

app.get("/", (req, res) => {
    // check if authed

    if (req.session.user) {
        console.log(req.session.user.profile)
        return res.redirect('/users/dashboard');
    }

    res.render('index');
})



server.listen(PORT, () => console.log("Server running on http://localhost:7878"));