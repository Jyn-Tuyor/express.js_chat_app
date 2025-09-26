const { Sequelize } = require("sequelize")

const sequelize = new Sequelize({
    'dialect': 'sqlite',
    'storage': './chat_app.db'
})

module.exports = sequelize 