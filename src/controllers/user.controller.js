const UserProfile = require("../models/UserProfile")
const User = require("../models/User")
const Chat = require("../models/Chat")
const { Op } = require("sequelize")


exports.createProfile = async (req, res) => {
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

    } catch (err) {
        res.status(500).render('create_profile', { errors: ["Something went wrong"] })
    }
}

exports.createProfileView = (req, res) => {
    const user_id = req.session.user.id
    res.render("create_profile", { user_id })
}

exports.myProfile = (req, res) => {
    const user = req.session.user;
    res.render("view_profile", { user });
}

exports.editProfile = (req, res) => {
    const user = req.session.user;

    res.render('edit_profile', { user });
}

exports.updateProfile = async (req, res) => {
    try {
        const { year_level, bio, gender, hobby_1, hobby_2, not_good } = req.body;

        const user = await User.findOne({ where: { id: req.session.user.id }, include: UserProfile })
        console.log("yl", year_level)
        user.user_profile.year_level = year_level
        user.user_profile.bio = bio
        user.user_profile.gender = gender
        user.user_profile.hobby_1 = hobby_1
        user.user_profile.hobby_2 = hobby_2
        user.user_profile.not_good = not_good

        await user.save()
        await user.user_profile.save()

        req.session.user = {
            id: user.id,
            id_number: user.id_number,
            username: user.username,
            profile: user.user_profile || null
        }

        res.redirect('/users/my-profile')

    } catch (err) {
        console.log("Error updating user: ", err)
    }

}

exports.chatRoom = async (req, res) => {
    const user = req.session.user;

    const chats = await Chat.findAll({ where: { broadcast: 'global' }, include: [{ model: User, as: "sender" }] });
    // console.log(chats)

    res.render("chat_room", { user, chats })
}

exports.privateChat = async (req, res) => {
    // const chat_with = await User.findOne({ where: { id: req.params.id }, include: [{ model: Chat, as: "receivedMessages"}] }) 
    // const user = await User.findOne({ 
    //     where: { id: req.session.user.id },
    //     include: [
    //         { 
    //             model: Chat,
    //             as: "sentMessages",
    //             where: { receiver_id: req.params.id },
    //             required: false
    //         }
    //     ]
    // }); 
    const receiver_id = req.params.id;
    const sender_id = req.session.user.id;
    const chat_with = await User.findOne({ where: { id: receiver_id } })
    const user = await User.findOne({ where: { id: sender_id } })
    const chats = await Chat.findAll({
        where: {
            [Op.or]: [
                { receiver_id: receiver_id, sender_id: sender_id },
                { receiver_id: sender_id, sender_id: receiver_id },
            ]
        }, include: [
            {
                model: User, as: "sender"
            },
            {
                model: User, as: "receiver"
            }
        ]
    })

    // console.log(user.toJSON())

    return res.render("private_chat", { user, chat_with, chats });
}