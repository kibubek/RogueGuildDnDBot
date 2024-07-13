const { SlashCommandBuilder } = require('@discordjs/builders');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ApplicationCommandType, ContextMenuCommandBuilder } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Verifikovat uživatele')
        .setType(ApplicationCommandType.Message),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('verificationModal')
            .setTitle('Verifikovat uživatele')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('accountName')
                        .setLabel('Account Name')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Zadej název účtu')
                        .setRequired(true)
                ), new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('messageId')
                        .setLabel('NEMĚNIT')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setValue(interaction.targetId)
                ));


        await interaction.showModal(modal);
    }
};
