// roll.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { roll } = require('../utils/rollMechanic');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls between 1 and your number')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Your number to roll from')
                .setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const userId = interaction.user.id;

        let rollResult = roll(amount, userId);

        return interaction.reply(`${interaction.user.username} rolled ${rollResult} (1 - ${amount})`);
    }
};
