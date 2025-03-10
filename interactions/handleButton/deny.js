const { Bet, Counteroffer } = require('../../models');

async function handleDeny(interaction) {
    const [action, counterofferId] = interaction.customId.split('_');

    const counteroffer = await Counteroffer.findByPk(counterofferId, {
        include: [
            {
                model: Bet,
                as: 'bet',
            },
        ],
    });

    if (!counteroffer) {
        return interaction.reply({ content: 'This counter offer is no longer active.', ephemeral: true });
    }

    const bet = counteroffer.bet;

    if (!bet) {
        return interaction.reply({ content: 'This bet is no longer active.', ephemeral: true });
    }

    if (bet.isRolled) {
        return interaction.reply({ content: 'This bet has already been accepted.', ephemeral: true });
    }

    await interaction.update({
        content: 'You refused the counter offer.',
        components: [],
    });

    /* await client.users.fetch(counteroffer.userId).then(user => user.send({
         content: `Vaše protinabídka byla odmítnuta.`,
     }));*/
}

module.exports = handleDeny;
