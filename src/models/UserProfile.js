const { DataTypes } = require("sequelize")
const User = require("./User")
const sequelize = require("../db")

const UserProfile = sequelize.define("user_profile", {
    "year_level": DataTypes.STRING,
    "gender": DataTypes.ENUM("male", "female", "other"),
    "hobby_1": DataTypes.STRING,
    "hobby_2": DataTypes.STRING,
    "not_good": DataTypes.STRING,
    "bio": DataTypes.STRING
})

User.hasOne(UserProfile, {
    as: "profile",
    foreignKey: {
        name: "user_id",
        allowNull: false
    },
    onDelete: 'cascade'
})

UserProfile.belongsTo(User, { foreignKey: 'user_id' })

module.exports = UserProfile