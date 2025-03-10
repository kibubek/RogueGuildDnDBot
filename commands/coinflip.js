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
                .setDescription('What do you want to bet?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('side')
                .setDescription('Which side do you choose?')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'Heads' },
                    { name: 'Tails', value: 'Tails' }
                ))
        .addStringOption(option =>
            option.setName('requesteditem')
                .setDescription('What would you like in return (optional)')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const item = interaction.options.getString('item');
            const requestedItem = interaction.options.getString('requesteditem');
            const chosenSide = interaction.options.getString('side');

            // Respond to the user in the interaction channel
            const reply = await interaction.reply({ content: 'Your bet has been created!', ephemeral: true, fetchReply: true });

            // Capture the message ID from the reply
            const originalMessageId = reply.id;

            // Create the bet in the database including the chosen side and originalMessageId
            const bet = await Bet.create({
                userId: interaction.user.id,
                username: interaction.user.username,
                item,
                requestedItem,
                chosenSide, // new field for chosen side
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
