// roll.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { roll } = require('../utils/rollMechanic');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Hod číslem mezi 1 a zadaným číslem')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Maximální číslo')
                .setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const userId = interaction.user.id;

        let rollResult = roll(amount, userId);

        return interaction.reply(`${interaction.user.username} hodil ${rollResult} (1 - ${amount})`);
    }
};
