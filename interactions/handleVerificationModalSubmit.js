const { Client, ModalSubmitInteraction, EmbedBuilder } = require('discord.js');
const { sequelize, Verification } = require('../models/verification');
const { VERIFIED_ROLE_ID } = require('../config.json');

/**
 * Handles the submission of the verification modal.
 *
 * @param {Client} client - The Discord client instance.
 * @param {ModalSubmitInteraction} interaction - The interaction object from the modal submission.
 */
async function handleVerificationModal(client, interaction) {
    console.log('Handling verification modal');
    await interaction.deferReply({ ephemeral: true });

    const accountName = interaction.fields.getTextInputValue('accountName');
    const discordId = interaction.user.id;
    const messageId = interaction.fields.getTextInputValue('messageId'); // Get the message ID from the modal fields

    try {
        // Check if the accountName or discordId already exists
        const existingAccount = await Verification.findOne({ where: { accountName } });
        const existingDiscordId = await Verification.findOne({ where: { discordId } });

        if (existingAccount) {
            await sendErrorReply(interaction, messageId, 'Toto jméno účtu je již obsazeno.');
            return;
        }

        if (existingDiscordId) {
            await sendErrorReply(interaction, messageId, 'Tento uživatel je již ověřen.');
            return;
        }

        // Insert into the database
        const verification = await Verification.create({ discordId, accountName, messageId });

        // Assign the verified role to the user
        const member = await interaction.guild.members.fetch(discordId);
        const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);

        if (role) {
            await member.roles.add(role);
            await sendSuccessReply(interaction, messageId, 'Uživatel byl úspěšně ověřen a byla mu přiřazena ověřovací role.');
        } else {
            await sendErrorReply(interaction, messageId, 'Ověření proběhlo úspěšně, ale roli nebylo možné přiřadit. Kontaktujte prosím administrátora.');
        }
    } catch (error) {
        console.error('Chyba při ověřování uživatele:', error);
        await sendErrorReply(interaction, messageId, 'Při pokusu o ověření došlo k chybě.');
    }
}

async function sendSuccessReply(interaction, messageId, content) {
    const followUpMessage = await interaction.followUp({ content, ephemeral: true });
    if (messageId) {
        try {
            const originalMessage = await interaction.channel.messages.fetch(messageId);
            await originalMessage.react('✅');
        } catch (error) {
            console.error('Nelze reagovat na původní zprávu:', error);
        }
    }
    return followUpMessage;
}

async function sendErrorReply(interaction, messageId, content) {
    const followUpMessage = await interaction.followUp({ content, ephemeral: true });
    if (messageId) {
        try {
            const originalMessage = await interaction.channel.messages.fetch(messageId);
            await originalMessage.react('❌');
        } catch (error) {
            console.error('Nelze reagovat na původní zprávu:', error);
        }
    }
    return followUpMessage;
}

module.exports = handleVerificationModal;
