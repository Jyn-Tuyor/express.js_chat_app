const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const UserProfile = sequelize.define("user_profile", {
    "year_level": DataTypes.STRING,
    "gender": DataTypes.ENUM("male", "female", "other"),
    "hobby_1": DataTypes.STRING,
    "hobby_2": DataTypes.STRING,
    "not_good": DataTypes.STRING,
    "bio": DataTypes.STRING
})

module.exports = UserProfile