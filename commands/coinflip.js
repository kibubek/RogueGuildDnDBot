const { SlashCommandBuilder } = require('@discordjs/builders');
const { Bet } = require('../models');
const { sendBetEmbed } = require('../utils/sendBetEmbed');
const { GAMBA_CHANNEL_ID } = require('../config.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin with a bet')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('Item, který vsázíš')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('requesteditem')
                .setDescription('Item, který by jsi chtěl nazpět')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const item = interaction.options.getString('item');
            const requestedItem = interaction.options.getString('requesteditem');

            // Respond to the user in the interaction channel
            const reply = await interaction.reply({ content: 'Vaše sázka byla přijata!', ephemeral: true, fetchReply: true });

            // Capture the message ID from the reply
            const originalMessageId = reply.id;

            // Create the bet in the database including originalMessageId
            const bet = await Bet.create({
                userId: interaction.user.id,
                username: interaction.user.username,
                item,
                requestedItem,
                originalMessageId,
            });

            console.log('Bet created:', bet);

            // Send the bet details to a specific channel via embed
            await sendBetEmbed(interaction.client, bet, interaction.user.username);
        } catch (error) {
            console.error('Error handling coinflip command:', error);
            // Handle errors appropriately
        }
    }
};
