const { Bet, Counteroffer } = require('../../models');
const { GAMBA_CHANNEL_ID } = require('../../config.json');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
async function handleConfirmMatch(client, interaction) {
    const betId = interaction.customId.split('_')[1];
    const bet = await Bet.findByPk(betId);

    if (!bet) {
        return interaction.reply({ content: 'This bet is no longer active.', ephemeral: true });
    }

    const counteroffer = await Counteroffer.create({
        betId: bet.id,
        userId: interaction.user.id,
        username: interaction.user.username,
        counterofferItem: bet.item,
    });


    const user = await client.users.fetch(bet.userId);
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`accept_${counteroffer.id}`)
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`deny_${counteroffer.id}`)
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger)
    );

    const betMessageLink = `https://discord.com/channels/1036552465534947358/${GAMBA_CHANNEL_ID}/${bet.originalMessageId}`;

    await user.send({
        content: `${interaction.user.username} called your bet with: ${bet.item}\n[Click here for the bet](${betMessageLink})`,
        components: [row],
    });

    await interaction.update({ content: 'Counter offer has been sent.', components: [], ephemeral: true });
}

module.exports = handleConfirmMatch;
