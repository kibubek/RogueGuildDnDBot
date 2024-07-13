const { SlashCommandBuilder } = require('@discordjs/builders');
const { Verification } = require('../models/verification');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('najit')
        .setDescription('Najde uživatele DnD Account Name')
        .addStringOption(option =>
            option.setName('accountname')
                .setDescription('Account name k nalezení')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Discord uživatel, kterého chceš najít')
                .setRequired(false)),

    async execute(interaction) {
        const accountName = interaction.options.getString('accountname');
        const user = interaction.options.getUser('user');

        if (!accountName && !user) {
            await interaction.reply({ content: 'Musíte zadat buď název účtu, nebo uživatele Discord.', ephemeral: true });
            return;
        }

        if (accountName && user) {
            await interaction.reply({ content: 'Můžete zadat pouze jednu možnost najednou: buď název účtu, nebo uživatele Discord.', ephemeral: true });
            return;
        }

        if (accountName) {
            const record = await Verification.findOne({ where: { accountName } });
            if (record) {
                await interaction.reply({ content: `Uživatel pro účet ${accountName} je <@${record.discordId}>.`, ephemeral: true });
            } else {
                await interaction.reply({ content: `Účet ${accountName} nebyl nalezen.`, ephemeral: true });
            }
        } else if (user) {
            const record = await Verification.findOne({ where: { discordId: user.id } });
            if (record) {
                await interaction.reply({ content: `Název účtu pro uživatele <@${user.id}> je ${record.accountName}.`, ephemeral: true });
            } else {
                await interaction.reply({ content: `Uživatel <@${user.id}> nebyl nalezen.`, ephemeral: true });
            }
        }
    },
};
