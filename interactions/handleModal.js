const { Bet, Counteroffer } = require('../models');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GAMBA_CHANNEL_ID } = require('../config.json');

async function handleModal(interaction, client) {
    const [action, betId] = interaction.customId.split('_');
    const bet = await Bet.findByPk(betId);

    if (action === 'counterofferModal') {
        const counterofferItem = interaction.fields.getTextInputValue('counterofferItem');

        const counteroffer = await Counteroffer.create({
            betId: bet.id,
            userId: interaction.user.id,
            username: interaction.user.username,
            counterofferItem,
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
            content: `Máte novou protinabídku od ${interaction.user.username}: ${counterofferItem}\n[Odkaz na sázku](${betMessageLink})`,
            components: [row],
        });

        await interaction.reply({ content: 'Protinabídka byla odeslána!', ephemeral: true });
    }
}

module.exports = handleModal;
