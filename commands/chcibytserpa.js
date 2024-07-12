const { SlashCommandBuilder } = require('@discordjs/builders');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chcibytserpa')
        .setDescription('Otevře žádost o šerpu'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('sherpa-application-modal')
            .setTitle('Staň se šerpou!')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('sherpa-answer-1')
                        .setLabel('Kolik máš nahraných hodin v DnD?')
                        .setMaxLength(15)
                        .setMinLength(2)
                        .setPlaceholder('Zadej číslo')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('sherpa-answer-2')
                        .setLabel('Tvůj věk?')
                        .setMaxLength(15)
                        .setMinLength(2)
                        .setPlaceholder('Zadej číslo')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('sherpa-answer-3')
                        .setLabel('Jaký bys měl postup zaučení nového hráče?')
                        .setMaxLength(500)
                        .setMinLength(2)
                        .setPlaceholder('Popiš nám přesně, co bys dělal!')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('sherpa-answer-4')
                        .setLabel('Umíš dodgovat všechny mobky?')
                        .setMaxLength(15)
                        .setMinLength(2)
                        .setPlaceholder('ANO/NE')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('sherpa-answer-5')
                        .setLabel('Na závěr se nám trošku popiš')
                        .setMaxLength(400)
                        .setMinLength(2)
                        .setPlaceholder('Popiš nám, co jsi za člověka!')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);
    }
};
