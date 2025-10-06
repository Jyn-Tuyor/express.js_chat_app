const bcrypt = require("bcrypt")
const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const User = sequelize.define("user", {
    username: { type: DataTypes.STRING, unique: false },
    id_number: { type: DataTypes.STRING, unique: true},
    password: DataTypes.STRING
}, {
    hooks: {
        beforeCreate: async(user) => {
            const hashed = await bcrypt.hash(user.password, 10);
            user.password = hashed; 
        },
    }
})

module.exports = User