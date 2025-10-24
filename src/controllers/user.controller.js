const UserProfile = require("../models/UserProfile")
const User = require("../models/User")
const Chat = require("../models/Chat")
const { Op } = require("sequelize")
const { Sequelize } = require("sequelize")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();
const sequelize = require("../db")

exports.myProfile = (req, res) => {
    // const user = req.session.user;
    res.render("view_profile");
}

exports.editProfile = (req, res) => {
    const user = req.session.user;

    res.render('edit_profile', { user });
}

exports.updateProfile = async (req, res) => {
    try {
        const { year_level, bio, gender, hobby_1, hobby_2, not_good } = req.body;

        let user = await prisma.user.findUnique({
            where:
            {
                id: req.session.user.id
            },
        })
        const user_id = user.id;

        await prisma.profile.upsert({
            where: { userId: user.id },
            update: {
                year_level,
                bio,
                gender,
                hobby_1,
                hobby_2,
                not_good
            },
            create: {
                year_level,
                bio,
                gender,
                hobby_1,
                hobby_2,
                not_good,
                user: { connect: { id: user.id } }
            }
        })
        let new_user = await prisma.user.findUnique({
            where:
            {
                id: req.session.user.id
            },
            include: {
                profile: true
            }
        })

        req.session.user = new_user

        res.redirect('/users/my-profile')

    } catch (err) {
        console.log("Error updating user: ", err)
    }

}

exports.chatRoom = async (req, res) => {
    const user = req.session.user;

    const chats = await Chat.findAll({
        where: {
            broadcast: 'global'
        },
        include: [
            {
                model: User,
                as: "sender"
            }],
        limit: 20,
        order: [['createdAt', 'DESC']],
    });

    chats.reverse()

    res.render("chat/chat_room", { user, chats })
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
    const chat_with = await User.findOne({
        where: { id: receiver_id }, include: [
            {
                model: UserProfile,
                as: "profile"
            }
        ]
    })
    const user = await User.findOne({ where: { id: sender_id } })
    const chats = await Chat.findAll({
        where: {
            [Op.or]: [
                { receiver_id: receiver_id, sender_id: sender_id },
                { receiver_id: sender_id, sender_id: receiver_id },
            ]
        }, include: [
            {
                model: User, as: "sender",
            },
            {
                model: User, as: "receiver",
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
    })

    chats.reverse()

    return res.render("chat/private_chat", { user, chat_with, chats });
}