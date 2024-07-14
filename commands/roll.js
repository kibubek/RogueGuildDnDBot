const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
        const rollResult = roll(amount);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`reroll_${rollResult}`)
                    .setLabel('Pokračovat v dalším rollu')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({
            content: `${interaction.user.username} rollnul ${rollResult} (1-${amount})`,
            components: [row]
        });

        const filter = i => i.customId.startsWith('reroll');
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            await i.deferUpdate();
            const newAmount = parseInt(i.customId.split('_')[1]);
            const newRollResult = roll(newAmount);

            const newRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`reroll_${newRollResult}`)
                        .setLabel('Pokračovat v dalším rollu')
                        .setStyle(ButtonStyle.Primary)
                );

            await i.followUp({
                content: `${i.user.username} rollnul ${newRollResult} (1-${newAmount})`,
                components: [newRow]
            });
        });

        collector.on('end', async collected => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('reroll')
                        .setLabel('Pokračovat v dalším rollu')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );

            await interaction.editReply({
                content: `${interaction.user.username} rollnul ${rollResult} (1-${amount})`,
                components: [disabledRow]
            });
        });

        function roll(max) {
            return Math.floor(Math.random() * max) + 1;
        }
    }
};
