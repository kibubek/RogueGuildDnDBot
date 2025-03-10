const { Bet, Counteroffer } = require('../../models');
const { EmbedBuilder } = require('discord.js');
const { GAMBA_CHANNEL_ID } = require('../../config.json');

async function handleAccept(interaction, client) {
    const [action, counterofferId] = interaction.customId.split('_');

    try {
        const counteroffer = await Counteroffer.findByPk(counterofferId, {
            include: [
                {
                    model: Bet,
                    as: 'bet',
                },
            ],
        });

        if (!counteroffer) {
            return interaction.reply({ content: 'This counter offer no longer exists.', ephemeral: true });
        }

        const bet = counteroffer.bet;

        if (!bet) {
            return interaction.reply({ content: 'This bet no longer exists', ephemeral: true });
        }

        if (bet.isRolled) {
            return interaction.reply({ content: 'This bet has been accepted already.', ephemeral: true });
        }

        bet.isAccepted = true;
        bet.isRolled = true;

        // Use the bet creator's chosen side; the counteroffer gets the opposite.
        const chosenSide = bet.chosenSide; // e.g., 'Heads' or 'Tails'
        const counterSide = chosenSide === 'Heads' ? 'Tails' : 'Heads';

        // Flip the coin:
        const flipResult = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const winner = flipResult === chosenSide ? bet.username : counteroffer.username;
        const loser = flipResult === chosenSide ? counteroffer.username : bet.username;
        const loserItem = loser === bet.username ? bet.item : counteroffer.counterofferItem;

        bet.winner = winner;
        await bet.save();

        const embed = new EmbedBuilder()
            .setTitle(`Bet: ${bet.username} vs ${counteroffer.username}`)
            .addFields(
                { name: 'Bookmaker', value: bet.username, inline: true },
                { name: 'Wager', value: bet.item, inline: true },
                { name: 'Chosen Side', value: bet.chosenSide, inline: true },
                { name: 'Bookmaker', value: counteroffer.username, inline: true },
                { name: 'Counteroffer Side', value: counterSide, inline: true },
                { name: 'Counteroffer', value: counteroffer.counterofferItem || 'N/A', inline: true }
            )
            .setThumbnail('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmh1b2R1bDc5dHZnd204cDkzZGs5YW13NHd5d2NycnFicTZwY3ptdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/v8ztn2aqiVhuS9cBZV/giphy.gif');

        const channel = await client.channels.fetch(GAMBA_CHANNEL_ID);

        let sentMessage;
        try {
            const originalMessage = await channel.messages.fetch(bet.originalMessageId);
            if (originalMessage) {
                await originalMessage.delete();
            }
        } catch (error) {
            console.error('Error fetching/deleting original message:', error);
        }

        try {
            sentMessage = await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending embed message:', error);
        }

        await interaction.update({
            content: `You have accepted this counteroffer! Results of the coinflip will be here shortly. [Here's the bet](https://discord.com/channels/1036552465534947358/${GAMBA_CHANNEL_ID}/${bet.originalMessageId})`,
            components: [],
        });
        setTimeout(async () => {
            try {
                const newThumbnail = flipResult === 'Heads'
                    ? 'https://seaofthieves.cz/wp-content/uploads/2024/07/heads.png'
                    : 'https://seaofthieves.cz/wp-content/uploads/2024/07/tails.png';

                const updatedEmbed = EmbedBuilder.from(sentMessage.embeds[0])
                    .setThumbnail(newThumbnail)
                    .setDescription(`**${winner}** won the bet! Loser **${loser}** must give **${loserItem}**.`)
                    .addFields(
                        { name: 'Result', value: flipResult, inline: true },
                        { name: 'Winner', value: winner, inline: true }
                    );

                await sentMessage.edit({ embeds: [updatedEmbed] });

                await client.users.fetch(bet.userId).then(user => user.send({
                    content: `Coin landed on ${flipResult}. Winner is ${winner}.`,
                }));

                await client.users.fetch(counteroffer.userId).then(user => user.send({
                    content: `Game's finished! Coin landed on ${flipResult}. Winner is ${winner}.`,
                }));
            } catch (error) {
                console.error('Error updating embed message:', error);
            }
        }, 15000);
    } catch (error) {
        console.error('Error handling accept button interaction:', error);
        await interaction.reply({ content: 'There has been an issue processing this request.', ephemeral: true });
    }
}

module.exports = handleAccept;
