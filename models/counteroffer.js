const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Counteroffer = sequelize.define('Counteroffer', {
        betId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Bets',
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        counterofferItem: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Counteroffer.associate = (models) => {
        Counteroffer.belongsTo(models.Bet, { as: 'bet', foreignKey: 'betId' });
    };

    return Counteroffer;
};
