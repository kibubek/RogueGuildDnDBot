const { Bet, Counteroffer } = require('../../models');
const { GAMBA_CHANNEL_ID } = require('../../config.json');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
async function handleConfirmMatch(client, interaction) {
    const betId = interaction.customId.split('_')[1];
    const bet = await Bet.findByPk(betId);

    if (!bet) {
        return interaction.reply({ content: 'Tato sázka již neexistuje.', ephemeral: true });
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
            .setLabel('Přijmout')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`deny_${counteroffer.id}`)
            .setLabel('Odmítnout')
            .setStyle(ButtonStyle.Danger)
    );

    const betMessageLink = `https://discord.com/channels/1036552465534947358/${GAMBA_CHANNEL_ID}/${bet.originalMessageId}`;

    await user.send({
        content: `Uživatel ${interaction.user.username} dorovnal vaší nabídku: ${bet.item}\n[Odkaz na sázku](${betMessageLink})`,
        components: [row],
    });

    await interaction.update({ content: 'Protinabídka byla odeslána.', components: [], ephemeral: true });
}

module.exports = handleConfirmMatch;
