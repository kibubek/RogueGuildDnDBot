const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GAMBA_CHANNEL_ID } = require('../config.json');

async function sendBetEmbed(client, bet, username) {
    const embed = new EmbedBuilder()
        .setTitle('Sázka na hod mincí')
        .addFields(
            { name: 'Uživatel', value: username, inline: true },
            { name: 'Položka', value: bet.item, inline: true }
        );

    if (bet.requestedItem) {
        embed.addFields({ name: 'Požadovaná položka', value: bet.requestedItem, inline: true });
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`counteroffer_${bet.id}`)
            .setLabel('Protinabídka')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`matchbet_${bet.id}`)
            .setLabel('Dorovnat')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`deletebet_${bet.id}`)
            .setLabel('Smazat sázku')
            .setStyle(ButtonStyle.Danger)
    );

    const channel = await client.channels.fetch(GAMBA_CHANNEL_ID);

    try {
        const message = await channel.send({ embeds: [embed], components: [row] });

        // Pin the message
        await message.pin();

        // Save the original message ID
        bet.originalMessageId = message.id;
        await bet.save();
    } catch (error) {
        console.error('Error sending and pinning message:', error);
    }
}

module.exports = { sendBetEmbed };
