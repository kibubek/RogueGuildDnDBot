const { Bet } = require('../../models');

async function handleDelete(interaction) {
    const [action, betId] = interaction.customId.split('_');

    try {
        const bet = await Bet.findByPk(betId);

        if (!bet) {
            return interaction.reply({ content: 'This bet is no longer active.', ephemeral: true });
        }

        if (interaction.user.id !== bet.userId) {
            return interaction.reply({ content: 'You can only delete your own bets.', ephemeral: true });
        }

        const message = await interaction.channel.messages.fetch(bet.originalMessageId);
        await message.delete();
        await bet.destroy();

        return interaction.reply({ content: 'Bet has been deleted.', ephemeral: true });
    } catch (error) {
        console.error('Error handling delete button interaction:', error);
        return interaction.reply({ content: 'There has been an issue with deleting the bet.', ephemeral: true });
    }
}

module.exports = handleDelete;
