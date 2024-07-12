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
        return interaction.reply({ content: 'Tato protinabídka již neexistuje.', ephemeral: true });
    }

    const bet = counteroffer.bet;

    if (!bet) {
        return interaction.reply({ content: 'Tato sázka již neexistuje.', ephemeral: true });
    }

    if (bet.isRolled) {
        return interaction.reply({ content: 'Tato sázka již byla přijata.', ephemeral: true });
    }

    await interaction.update({
        content: 'Odmítli jste protinabídku.',
        components: [],
    });

    await client.users.fetch(counteroffer.userId).then(user => user.send({
        content: `Vaše protinabídka byla odmítnuta.`,
    }));
}

module.exports = handleDeny;
