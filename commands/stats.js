const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { Bet, Counteroffer } = require('../models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Statistiky uživatelova gamble života')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Uživatel, kterého chceš listnout')
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
                const goldMatch = item.match(/^(\d+)g?$/);
                if (goldMatch) {
                    return { type: 'gold', value: parseInt(goldMatch[1]) };
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
                .setTitle(`Statistiky gamble života uživatele ${user.username}`)
                .addFields(
                    { name: 'Celkem sázek', value: totalBets.toString(), inline: true },
                    { name: 'Celkem výher', value: totalWins.toString(), inline: true },
                    { name: 'Celkem protinávrhů', value: totalCounteroffers.toString(), inline: true },
                    { name: 'Celkem přijatých sázek', value: totalAcceptedBets.toString(), inline: true },
                    { name: 'Celkem vsazeno zlata', value: totalGoldBet.toString() + 'g', inline: true },
                    { name: 'Celkem vyhrané zlato', value: totalGoldWon.toString() + 'g', inline: true },
                    { name: 'Celkem prohrané zlato', value: totalGoldLost.toString() + 'g', inline: true },
                    { name: 'Zlato bilance', value: goldBalanceText, inline: false }
                );

            if (totalItemsWon.length > 0) {
                embed.addFields({ name: 'Vyhrané položky', value: totalItemsWon.join(', '), inline: false });
            }

            if (totalItemsLost.length > 0) {
                embed.addFields({ name: 'Prohrané položky', value: totalItemsLost.join(', '), inline: false });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            await interaction.reply({ content: 'Při načítání statistik došlo k chybě.', ephemeral: true });
        }
    }
};
