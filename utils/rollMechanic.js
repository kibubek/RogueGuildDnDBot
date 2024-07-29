// utils/rollMechanic.js

const roll = (max) => {
    return Math.floor(Math.random() * max) + 1;
};

module.exports = {
    roll,
};
