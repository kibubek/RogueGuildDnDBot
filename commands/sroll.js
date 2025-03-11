const { SlashCommandBuilder } = require('@discordjs/builders');
const { roll } = require('../utils/rollMechanic');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const RollBet = require('../models/rollBet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sroll')
        .setDescription('Smart deathroll with buttons')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Bet amount')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Who to bet against?')
                .setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const challenged = interaction.options.getUser('member');
        const initiator = interaction.user;
        let currentTurn = challenged.id; // Start with the challenged user's turn

        let rollResult = roll(amount, initiator.id);
        const bet = await RollBet.create({
            initiatorId: initiator.id,
            challengedId: challenged.id,
            initiatorTag: initiator.tag,
            challengedTag: challenged.tag,
            amount: amount,
        });

        const replyContent = `<@${initiator.id}> challenged <@${challenged.id}> to roll for ${amount}.\n${initiator.tag} rolled ${rollResult} (1 - ${amount})`;

        if (rollResult === 1) {
            await bet.update({ gameStatus: 'finished', winner: challenged.id });
            return interaction.reply(`${replyContent}\n${initiator.tag} lost! <a:todding:1347897995298869259><a:todding:1347897995298869259><a:todding:1347897995298869259>`);
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`counterRoll_${bet.id}`)
                    .setLabel('Counter roll')
                    .setStyle(ButtonStyle.Primary)
            );

        const message = await interaction.reply({ content: replyContent, components: [row], fetchReply: true });

        const createCollector = (msg, turn) => {
            const filter = i => i.customId === `counterRoll_${bet.id}`;
            const collector = msg.createMessageComponentCollector({ filter, time: 6000000 });

            collector.on('collect', async i => {
                if (i.user.id !== turn) {
                    await i.reply({ content: `It's not your turn!`, ephemeral: true });
                    return; // Do not stop the collector
                }

                const lastRollResult = parseInt(i.message.content.match(/(\d+) \(1 - \d+\)/)[1], 10);
                let newRollResult = roll(lastRollResult, i.user.id);

                if (newRollResult === 1) {
                    await bet.update({ gameStatus: 'finished', winner: i.user.id === initiator.id ? challenged.id : initiator.id });
                    await i.message.edit({ components: [] }); // Remove button from the original message
                    await i.reply({ content: `${i.user.tag} rolled ${newRollResult} and lost! <a:todding:1347897995298869259>`, components: [] });
                    collector.stop();
                } else {
                    await i.message.edit({ components: [] }); // Remove button from the original message

                    const newReplyContent = `${i.user.tag} rolled ${newRollResult} (1 - ${lastRollResult})`;

                    const newRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`counterRoll_${bet.id}`)
                                .setLabel('Counter roll')
                                .setStyle(ButtonStyle.Primary)
                        );

                    currentTurn = currentTurn === initiator.id ? challenged.id : initiator.id; // Switch turn
                    const newMessage = await i.reply({ content: newReplyContent, components: [newRow], fetchReply: true });

                    collector.stop();
                    createCollector(newMessage, currentTurn); // Start a new collector for the new message
                }
            });

            collector.on('end', async collected => {
                if (collected.size === 0 && bet.gameStatus !== 'finished') {
                    await msg.edit({ content: `${msg.content}\n${turn === initiator.id ? initiator.tag : challenged.tag} took too long to roll and lost to timeout!`, components: [] });
                    await bet.update({ gameStatus: 'finished' });
                }
            });
        };

        createCollector(message, currentTurn); // Start the initial collector
    }
};
