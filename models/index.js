const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
});

const Bet = require('./bet')(sequelize);
const Counteroffer = require('./counteroffer')(sequelize);

const models = { Bet, Counteroffer };

// Ensure associations are properly defined
Object.keys(models).forEach(modelName => {
    if ('associate' in models[modelName]) {
        models[modelName].associate(models);
    }
});

sequelize.sync({ force: false }).then(() => {
    console.log("Database synchronized");
}).catch((error) => {
    console.error("Error synchronizing database:", error);
});

module.exports = { ...models, sequelize };
