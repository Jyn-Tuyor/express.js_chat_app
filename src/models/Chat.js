const sequelize = require("../db")
const { DataTypes } = require("sequelize")
const User = require("./User")

const Chat = sequelize.define("chat", {
    message: { type: DataTypes.STRING, allowNull: false },
    broadcast: { type: DataTypes.ENUM('global', 'private')},
    type: { type: DataTypes.ENUM('join', 'left', 'chat')}
})

Chat.belongsTo(User, {
    as: "sender",
    foreignKey: {
        name: "sender_id",
        allowNull: false
    },
    onDelete: 'cascade'
})

Chat.belongsTo(User, {
    as: "receiver",
    foreignKey: {
        name: "foreign_id",
        allowNull: true
    },
    onDelete: 'cascade'
})

User.hasMany(Chat, { as: "sentMessages", foreignKey: "sender_id"});
User.hasMany(Chat, { as: "receivedMessages", foreignKey: "receiver_id"});

module.exports = Chat