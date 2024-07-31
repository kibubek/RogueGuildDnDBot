const { Client, Events, GatewayIntentBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Check if the message is in the specific channel and not from a bot
        if (message.channel.id === config.SUGGESTION_CHANNEL_ID && !message.author.bot) {
            try {
                // React with the specified emojis
                await message.react('<:checkmark:1268214755257221292>');
                await message.react('<:crossmark:1268214756611723429>');

                // Create a thread named "Návrh uživatele <messageauthor>"
                await message.startThread({
                    name: `Návrh uživatele ${message.author.username}`,
                    autoArchiveDuration: 1440, // 24 hours
                    reason: 'Automatic thread creation for new message'
                });
            } catch (error) {
                console.error('Failed to react or create thread:', error);
            }
        }
    }
};
