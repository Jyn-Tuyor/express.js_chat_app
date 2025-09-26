const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")
const User  = require("../models/User")


router.get("/register", (req, res) => {
    res.render("register")
})

router.post("/users/store", async (req, res) => {
    // console.log(req.body)
    try {
        const { username, id_number, password, password_confirmation } = req.body;

        if (password != password_confirmation) {
            return res.redirect('/register');
        }

        const new_user = User.create({ username, id_number, password });
        console.log(new_user)

        return res.status(201).redirect('/');

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
   

    return res.redirect('/register');
})

router.post("/login", async(req, res) => {
    const { id_number, password } = req.body;

    // if (id_number == '' && password == '') return res.status(400).render('index', { error: { type: 'all', message: "All fields required."}})
    // else if(id_number == '') return res.status(400).render('index', { error: { type: 'id_number', message: "ID field required."}})
    // else if(password == '') return res.status(400).render('index', { error: { type: 'password', message: "Password field required."}})
    let errors = []

    if (!id_number) {
        errors.push("ID field required.")
    }

    if (!password) {
        errors.push("Password field required.")
    }

    if (!id_number || !password) {
        return res.status(400).render("index", { errors })
    }

    // console.log(User)
    // return res.redirect('/')
    const user = await User.findOne({ where: { id_number }});

    if (!user) {
        // error: user not found
        return res.status(400).redirect('/');
    }
    const isValid = await bcrypt.compare(password, user.password) 
    if (!isValid) {
        // login failed
        return res.status(400).redirect('/');
    }

    req.session.user = { id: user.id, id_number: user.id_number, username: user.username }
    
    res.redirect('/users/dashboard')

})

router.post("/logout", async(req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

module.exports = router;