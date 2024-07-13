const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'verification.sqlite',
    logging: false,

});

const Verification = sequelize.define('Verification', {
    discordId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    messageId: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

sequelize.sync({ force: false }).then(() => {
    console.log("Verification database synchronized");
}).catch((error) => {
    console.error("Error synchronizing database:", error);
});
module.exports = { sequelize, Verification };
