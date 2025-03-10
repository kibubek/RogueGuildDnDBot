const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { Bet, Counteroffer } = require('../models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`Gambler's life statistics`)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who?')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user');
            let whereClause = { userId: user.id };

            const bets = await Bet.findAll({ where: whereClause });
            const counteroffers = await Counteroffer.findAll({ where: whereClause });

            let totalBets = bets.length;
            let totalWins = bets.filter(bet => bet.isRolled && bet.winner === user.username).length;
            let totalCounteroffers = counteroffers.length;
            let totalAcceptedBets = bets.filter(bet => bet.isAccepted).length;

            let totalGoldBet = 0;
            let totalGoldWon = 0;
            let totalItemsWon = [];
            let totalGoldLost = 0;
            let totalItemsLost = [];

            const parseBetItem = (item) => {
                const goldMatch = item.match(/^(\d+(?:\.\d+)?)([kKgG]?)$/);
                if (goldMatch) {
                    let value = parseFloat(goldMatch[1]);
                    if (goldMatch[2].toLowerCase() === 'k') {
                        value *= 1000;
                    }
                    return { type: 'gold', value: value };
                } else {
                    return { type: 'item', value: item };
                }
            };

            bets.forEach(bet => {
                const parsedBet = parseBetItem(bet.item);
                if (parsedBet.type === 'gold') {
                    totalGoldBet += parsedBet.value;
                }

                if (bet.isRolled && bet.winner) {
                    if (bet.winner === bet.username) {
                        if (parsedBet.type === 'gold') {
                            totalGoldWon += parsedBet.value;
                        } else {
                            totalItemsWon.push(parsedBet.value);
                        }
                    } else {
                        if (parsedBet.type === 'gold') {
                            totalGoldLost += parsedBet.value;
                        } else {
                            totalItemsLost.push(parsedBet.value);
                        }
                    }
                }
            });

            counteroffers.forEach(counteroffer => {
                const bet = bets.find(b => b.id === counteroffer.betId);
                if (bet && bet.isRolled && bet.winner === counteroffer.username) {
                    const parsedCounteroffer = parseBetItem(counteroffer.counterofferItem);
                    if (parsedCounteroffer.type === 'gold') {
                        totalGoldWon += parsedCounteroffer.value;
                    } else {
                        totalItemsWon.push(parsedCounteroffer.value);
                    }
                }
            });

            const goldBalance = totalGoldWon - totalGoldLost;
            const goldBalanceText = goldBalance >= 0 ? `v plusu o ${goldBalance}g` : `v mínusu o ${Math.abs(goldBalance)}g`;

            const embed = new EmbedBuilder()
                .setTitle(`${user.username} statistics`)
                .addFields(
                    { name: 'Total Bets', value: totalBets.toString(), inline: true },
                    { name: 'Total Wins', value: totalWins.toString(), inline: true },
                    { name: 'Total Counter Offers', value: totalCounteroffers.toString(), inline: true },
                    { name: 'Total Accepted Bets', value: totalAcceptedBets.toString(), inline: true },
                    { name: 'Total Gold Wagered', value: totalGoldBet.toString() + 'g', inline: true },
                    { name: 'Total Gold Won', value: totalGoldWon.toString() + 'g', inline: true },
                    { name: 'Total Gold Lost', value: totalGoldLost.toString() + 'g', inline: true },
                    { name: 'Total Gold', value: goldBalanceText, inline: false }
                );

            if (totalItemsWon.length > 0) {
                embed.addFields({ name: 'Items won', value: totalItemsWon.join(', '), inline: false });
            }

            if (totalItemsLost.length > 0) {
                embed.addFields({ name: 'Items lost', value: totalItemsLost.join(', '), inline: false });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            await interaction.reply({ content: 'There has been an issue with loading up statistics.', ephemeral: true });
        }
    }
};
