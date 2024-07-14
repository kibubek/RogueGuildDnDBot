const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rollneš číslo od 1 do zadaného počtu')
        .addIntegerOption(option =>
            option.setName('castka')
                .setDescription('Číslo, které chceš rollnout')
                .setRequired(true)),

    async execute(interaction) {
        const amount = interaction.options.getInteger('castka');

        const rollResult = Math.floor(Math.random() * amount) + 1;

        await interaction.reply(${ interaction.user.username } rollnul ${ rollResult }(1 - ${ amount }));
    }
};