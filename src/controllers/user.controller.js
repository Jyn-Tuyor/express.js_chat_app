const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

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
    const chats = await prisma.chat.findMany({
        where: {
            broadcast: 'public'
        },
        include: 
            {
                sender: true
            },
        take: 20,
        orderBy: {
            createdAt: 'desc'
        }
    });

    // chats.reverse()

    res.render("chat/chat_room", { chats })
}

exports.privateChat = async (req, res) => {
    const receiver_id = req.params.id;
    const sender_id = req.session.user.id;
    const chat_with = await prisma.user.findUnique({
        where: { id: receiver_id }, 
        include: {
            profile: true
        }
    })
    const user = await prisma.user.findUnique({ where: { id: parseInt(sender_id) } })
    const chats = await prisma.chat.findMany({
        where: {
            OR: [
                { receiverId: receiver_id, senderId: sender_id },
                { receiverId: sender_id, senderId: receiver_id },
            ]
        }, 
        include: {
            sender: true,
            receiver: true 
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    })

    chats.reverse()

    return res.render("chat/private_chat", { user, chat_with, chats });
}