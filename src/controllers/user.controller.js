const UserProfile = require("../models/UserProfile")

exports.createProfile = async(req, res) => {
    try {
        const { year_level, gender, hobby_1, hobby_2, not_good, bio } = req.body;
        const user_id = req.session.user.id;
        const profile = await UserProfile.create({
            "year_level": year_level,
            "gender": gender,
            "hobby_1": hobby_1,
            "hobby_2": hobby_2,
            "not_good": not_good,
            "bio": bio,
            "user_id": user_id
        })

        return res.status(201).redirect('/users/create-profile');

    } catch(err) {
        res.status(500).render('create_profile', { errors: ["Something went wrong"]})
    }
}

exports.createProfileView = (req, res) => {
    const user_id = req.session.user.id
    res.render("create_profile", { user_id })
}

exports.myProfile = (req, res) =>{ 
    const user = req.session.user;
    res.render("view_profile", { user });
}