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
            return interaction.reply({ content: 'Tato protinabídka již neexistuje.', ephemeral: true });
        }

        const bet = counteroffer.bet;

        if (!bet) {
            return interaction.reply({ content: 'Tato sázka již neexistuje.', ephemeral: true });
        }

        if (bet.isRolled) {
            return interaction.reply({ content: 'Tato sázka již byla přijata.', ephemeral: true });
        }

        bet.isAccepted = true;
        bet.isRolled = true;

        // Randomly assign heads and tails
        const isBetUserHeads = Math.random() < 0.5;
        const headsUser = isBetUserHeads ? bet.username : counteroffer.username;
        const tailsUser = isBetUserHeads ? counteroffer.username : bet.username;

        const flipResult = Math.random() < 0.5 ? 'Hlava' : 'Ocas';
        const winner = flipResult === 'Hlava' ? headsUser : tailsUser;
        const loser = flipResult === 'Hlava' ? tailsUser : headsUser;
        const loserItem = loser === bet.username ? bet.item : counteroffer.counterofferItem;

        bet.winner = winner;
        await bet.save();

        const embed = new EmbedBuilder()
            .setTitle(`Sázka ${bet.username} vs ${counteroffer.username}`)
            .addFields(
                { name: 'Sázkař', value: bet.username, inline: true },
                { name: 'Vsadil', value: bet.item, inline: true },
                { name: `Strana mince`, value: `${isBetUserHeads ? 'Hlava' : 'Ocas'}`, inline: true },
                { name: 'Sázkař', value: counteroffer.username, inline: true },
                { name: 'Vsadil', value: counteroffer.counterofferItem, inline: true },
                { name: `Strana mince`, value: `${isBetUserHeads ? 'Ocas' : 'Hlava'}`, inline: true }
            )
            .setThumbnail('https://i.imgur.com/dWzMEMy.gif');

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
            content: `Přijali jste protinabídku! Výsledek bude oznámen za chvíli. [Zde máte sázku](https://discord.com/channels/1036552465534947358/${GAMBA_CHANNEL_ID}/${bet.originalMessageId})`,
            components: [],
        });
        setTimeout(async () => {
            try {
                const newThumbnail = flipResult === 'Hlava'
                    ? 'https://seaofthieves.cz/wp-content/uploads/2024/07/heads.png'
                    : 'https://seaofthieves.cz/wp-content/uploads/2024/07/tails.png';

                const updatedEmbed = EmbedBuilder.from(sentMessage.embeds[0])
                    .setThumbnail(newThumbnail)
                    .setDescription(`Vítězem je **${winner}**. Poražený **${loser}** musí odevzdat **${loserItem}**.`)
                    .addFields(
                        { name: 'Výsledek', value: flipResult, inline: true },
                        { name: 'Vítěz', value: winner, inline: true }
                    );

                await sentMessage.edit({ embeds: [updatedEmbed] });

                await client.users.fetch(bet.userId).then(user => user.send({
                    content: `Výsledek je ${flipResult}. Vítězem je ${winner}.`,
                }));

                await client.users.fetch(counteroffer.userId).then(user => user.send({
                    content: `Hra dokončena! Výsledek je ${flipResult}. Vítězem je ${winner}.`,
                }));
            } catch (error) {
                console.error('Error updating embed message:', error);
            }
        }, 15000);
    } catch (error) {
        console.error('Error handling accept button interaction:', error);
        await interaction.reply({ content: 'Nastala chyba při zpracování vašeho požadavku.', ephemeral: true });
    }
}

module.exports = handleAccept;
