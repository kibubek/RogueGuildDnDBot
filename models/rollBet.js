// models/rollBet.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'rollBets.sqlite',
    logging: false,
});

const RollBet = sequelize.define('RollBet', {
    initiatorId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    challengedId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    initiatorTag: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    challengedTag: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    gameStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ongoing',
    },
    winner: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

sequelize.sync();

module.exports = RollBet;
