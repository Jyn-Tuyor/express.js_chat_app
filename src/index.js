const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const http = require("http")
const path = require('path')
const session = require("express-session")
const auth = require("./middleware/auth")
const socketInit = require("./socket")

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Initialize tables
const User = require("./models/User")
require("./models/UserProfile")
require("./models/Chat")


// sequelize.sync({ force: false });
const dotenv = require("dotenv")
const UserProfile = require("./models/UserProfile")
dotenv.config()

const PORT = 7878;
const app = express();


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

// Make user available in all EJS
app.use((req, res, next) => {
    res.locals.user = req.session.user ? req.session.user : null;
    next();
});


// Web socket   
const server = http.createServer(app)

// Socket logics are in here
socketInit(server)

// routes
app.use('/', require('./routes/auth.routes'));

// protected route
const protectedRoutes = express.Router();
protectedRoutes.use(auth);


protectedRoutes.use("/", require("./routes/user.routes"))

protectedRoutes.get("/dashboard", async(req, res) => {

    // search for user
    const user_id = req.query.user_id

    if (user_id) {
        const fetched_users = await prisma.user.findMany({ 
            where: {
                id_number: {
                    contains: user_id,
                    // mode: 'insensitive'
                }
            } 
        })
        return res.render("dashboard", { fetched_users })
    }

    return res.render("dashboard")
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