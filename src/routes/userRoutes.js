const express = require("express")
const router = express.Router();
const UserProfile = require("../models/UserProfile")

router.get("/create-profile", (req, res) => {
    res.render("create_profile")
})

router.post('/profile/store', async(req, res) => {
    try {
        const { year_level, gender, hobby_1, hobby_2, not_good, bio } = req.body;

        // const profile = await UserProfile.create({
        //     "year_level": year_level,
        //     "gender": gender,
        //     "hobby_1": hobby_1,
        //     "hobby_2": hobby_2,
        //     "not_good": not_good,
        //     "bio": bio
        // })

        console.log(req.body)

        return res.status(201).redirect('/users/create-profile');

    } catch(err) {
        res.status(500).render('create_profile', { errors: ["Something went wrong"]})
    }

})


module.exports = router;