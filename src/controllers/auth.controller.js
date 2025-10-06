const User = require('../models/User')
const UserProfile = require("../models/UserProfile")
const bcrypt = require("bcrypt")

exports.login = async (req, res) => {
    try {

        const { id_number, password } = req.body;

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

        const user = await User.findOne({
            where: { id_number: id_number },
            include: [
                {
                    model: UserProfile,
                    as: "profile"
                }
            ]
        });

        if (!user) {
            errors.push("Account not found.")
            return res.render('index', { errors })
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            errors.push("Incorrect password.")
            return res.render('index', { errors })
        }

        req.session.user = {
            id: user.id,
            id_number: user.id_number,
            username: user.username,
            profile: user.profile || null
        }


        res.redirect('/users/dashboard')
    } catch (err) {
        errors.push("Something went wrong.")
        return res.render('index', { errors })

    }

}

exports.register = async (req, res) => {
    try {
        const { username, id_number, password, password_confirmation } = req.body;

        if (password != password_confirmation) {
            return res.redirect('/register');
        }

        const isIdNotUnique = await User.findOne({ where: { id_number: id_number } });

        if (!isIdNotUnique) {
            const new_user = await User.create({ username, id_number, password });
        } else {
            return res.status(201).render('register', { error: "The ID number has already been taken." });
        }

        return res.status(201).redirect('/');

    } catch (err) {
        return res.status(201).render('register', { error: "Something wen't wrong." });
        // res.status(400).json({ error: err.message });
    }
}

exports.registerView = (req, res) => {
    res.render("register")
}

exports.logout = async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}

