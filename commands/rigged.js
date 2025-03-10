const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rigged')
        .setDescription('Assure players that the game is not rigged'),

    async execute(interaction) {
        await interaction.reply({
            content: 'Check out our repository: https://github.com/kibubek/RogueGuildDnDBot. We assure you, it’s not rigged!',
            ephemeral: false,
        });
    }
};
