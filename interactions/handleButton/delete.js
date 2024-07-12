const { Bet } = require('../../models');

async function handleDelete(interaction) {
    const [action, betId] = interaction.customId.split('_');

    try {
        const bet = await Bet.findByPk(betId);

        if (!bet) {
            return interaction.reply({ content: 'Tato sázka již neexistuje.', ephemeral: true });
        }

        if (interaction.user.id !== bet.userId) {
            return interaction.reply({ content: 'Tuto sázku může smazat pouze ten, kdo ji vytvořil.', ephemeral: true });
        }

        const message = await interaction.channel.messages.fetch(bet.originalMessageId);
        await message.delete();
        await bet.destroy();

        return interaction.reply({ content: 'Sázka byla úspěšně smazána.', ephemeral: true });
    } catch (error) {
        console.error('Error handling delete button interaction:', error);
        return interaction.reply({ content: 'Nastala chyba při mazání sázky.', ephemeral: true });
    }
}

module.exports = handleDelete;
