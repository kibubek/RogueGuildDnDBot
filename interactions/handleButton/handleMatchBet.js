const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Bet } = require('../../models');

async function handleMatchBet(interaction) {
    const betId = interaction.customId.split('_')[1];
    const bet = await Bet.findByPk(betId);

    if (!bet) {
        return interaction.reply({ content: 'This bet is no longer active.', ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`confirmmatch_${bet.id}`)
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`cancelmatch_${bet.id}`)
            .setLabel('No')
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
        content: `Are you sure you want to call with ${bet.item}?`,
        components: [row],
        ephemeral: true
    });
}


module.exports = handleMatchBet;
