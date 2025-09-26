const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const path = require('path')
const session = require("express-session")
const sequelize = require("./db")
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

// routes
app.use('/', require('./routes/authRoutes'));
app.use("/users", require("./routes/userRoutes"))

app.get("/", (req, res) => {
    // res.send('hello, world!!!');
    res.render('index');
})

app.get("/dashboard", (req, res) => {
    res.render("dashboard")
})



app.listen(7878, () => console.log("Server running on http://localhost:7878"));
