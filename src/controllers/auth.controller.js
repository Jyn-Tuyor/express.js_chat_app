const User = require('../models/User')
const UserProfile = require("../models/UserProfile")
const bcrypt = require("bcrypt")

exports.login = async (req, res) => {
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
    const user = await User.findOne({
        where: { id_number },
        include: [
            {
                model: UserProfile,
                as: "profile"
            }
        ]
    });

    if (!user) {
        // error: user not found
        return res.status(400).redirect('/');
    }
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
        errors.push("Account not found.")
        // login failed
        // return res.status(400).redirect('/');
        return res.render('index', { errors })
    }

    req.session.user = {
        id: user.id,
        id_number: user.id_number,
        username: user.username,
        profile: user.profile || null
    }


    console.log(user.toJSON())

    res.redirect('/users/dashboard')
}

exports.register =  async (req, res) => {
    try {
        const { username, id_number, password, password_confirmation } = req.body;

        if (password != password_confirmation) {
            return res.redirect('/register');
        }

        const new_user = User.create({ username, id_number, password });

        return res.status(201).redirect('/');

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
   

    return res.redirect('/register');
}

exports.registerView = (req, res) => {
    res.render("register")
}

exports.logout =  async(req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}