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
        let amount = interaction.options.getInteger('castka');
        let rollResult = Math.floor(Math.random() * amount) + 1;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('reroll')
                    .setLabel('Pokračovat v dalším rollu')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({
            content: `## ${interaction.user.username} rollnul **${rollResult}** (1-${amount})`,
            components: [row]
        });

        const filter = i => i.customId === 'reroll' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'reroll') {
                amount = rollResult;
                rollResult = Math.floor(Math.random() * amount) + 1;

                const newRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('reroll')
                            .setLabel('Pokračovat v dalším rollu')
                            .setStyle(ButtonStyle.Primary)
                    );

                await i.reply({
                    content: `## ${interaction.user.username} rollnul **${rollResult}** (1-${amount})`,
                    components: [newRow]
                });
            }
        });

        collector.on('end', async collected => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('reroll')
                        .setLabel('Re-roll')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );

            await interaction.editReply({
                content: `## ${interaction.user.username} rollnul **${rollResult}** (1-${amount})`,
                components: [disabledRow]
            });
        });
    }
};
