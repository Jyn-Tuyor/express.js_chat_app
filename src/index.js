const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const http = require("http")
const path = require('path')
const session = require("express-session")
const sequelize = require("./db")
const auth = require("./middleware/auth")
const socketInit = require("./socket")

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

// Socket logics are in here
socketInit(server)


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