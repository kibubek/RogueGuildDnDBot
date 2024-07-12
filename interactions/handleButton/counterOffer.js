const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const { Bet } = require('../../models');

async function handleCounterOffer(interaction) {
    const betId = interaction.customId.split('_')[1];
    const bet = await Bet.findByPk(betId);

    if (!bet) {
        return interaction.reply({ content: 'Tato sázka již neexistuje.', ephemeral: true });
    }

    const modal = new ModalBuilder()
        .setCustomId(`counterofferModal_${bet.id}`)
        .setTitle('Protinabídka')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('counterofferItem')
                    .setLabel('Položka protinabídky')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            )
        );

    await interaction.showModal(modal);
}

module.exports = handleCounterOffer;
