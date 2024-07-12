const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Bet = sequelize.define('Bet', {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        item: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        requestedItem: {
            type: DataTypes.STRING,
        },
        isAccepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isRolled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        winner: {
            type: DataTypes.STRING,
        },
        originalMessageId: {
            type: DataTypes.STRING,
            allowNull: true, // Allow null initially
        },
    });

    Bet.associate = (models) => {
        Bet.hasMany(models.Counteroffer, { as: 'counteroffers', foreignKey: 'betId' });
    };

    return Bet;
};
