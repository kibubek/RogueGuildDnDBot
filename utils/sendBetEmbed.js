const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GAMBA_CHANNEL_ID } = require('../config.json');

async function sendBetEmbed(client, bet, username) {
    const embed = new EmbedBuilder()
        .setTitle(`Coinflip bet by ${username}`)
        .addFields(
            { name: 'User', value: username, inline: true },
            { name: 'Bet', value: bet.item, inline: true },
            { name: 'Chosen Side', value: bet.chosenSide || 'Not selected', inline: true }
        );

    if (bet.requestedItem) {
        embed.addFields({ name: 'Requested Item', value: bet.requestedItem, inline: true });
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`counteroffer_${bet.id}`)
            .setLabel('Counter offer')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`matchbet_${bet.id}`)
            .setLabel('Call')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`deletebet_${bet.id}`)
            .setLabel('Delete bet')
            .setStyle(ButtonStyle.Danger)
    );

    const channel = await client.channels.fetch(GAMBA_CHANNEL_ID);

    try {
        const message = await channel.send({ embeds: [embed], components: [row] });
        await message.pin();

        // Save the updated message id if needed
        bet.originalMessageId = message.id;
        await bet.save();
    } catch (error) {
        console.error('Error sending and pinning message:', error);
    }
}

module.exports = { sendBetEmbed };
