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
                .setRequired(false)),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user');
            let totalBets, totalWins, totalCounteroffers, totalAcceptedBets, totalDeniedCounteroffers;

            if (user) {
                totalBets = await Bet.count({ where: { userId: user.id } });
                totalWins = await Bet.count({ where: { userId: user.id, isRolled: true } });
                totalCounteroffers = await Counteroffer.count({ where: { userId: user.id } });
                totalAcceptedBets = await Bet.count({ where: { userId: user.id, isAccepted: true } });
                //                totalDeniedCounteroffers = await Counteroffer.count({ where: { userId: user.id, status: 'denied' } }); // Assuming you have a status field
            } else {
                totalBets = await Bet.count();
                totalWins = await Bet.count({ where: { isRolled: true } });
                totalCounteroffers = await Counteroffer.count();
                totalAcceptedBets = await Bet.count({ where: { isAccepted: true } });
                //                totalDeniedCounteroffers = await Counteroffer.count({ where: { status: 'denied' } }); // Assuming you have a status field
            }

            const embed = new EmbedBuilder()
                .setTitle(user ? `${user.username}'s Gambla statistiky` : 'Globální gamble statistiky')
                .addFields(
                    { name: 'Celkem sázek', value: totalBets.toString(), inline: true },
                    { name: 'Celkem výher', value: totalWins.toString(), inline: true },
                    { name: 'Celkem protinabídek', value: totalCounteroffers.toString(), inline: true },
                    { name: 'Celkem přijatých sázek', value: totalAcceptedBets.toString(), inline: true },
                    //         { name: 'Total Denied Counteroffers', value: totalDeniedCounteroffers.toString(), inline: true }
                )
                .setColor('#FFA500')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            await interaction.reply({ content: 'Narazil jsem na error při vytahování statistik.', ephemeral: true });
        }
    }
};
