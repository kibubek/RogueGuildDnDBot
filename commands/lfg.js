const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { Verification } = require('../models/verification'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lfg')
        .setDescription('Hledám skupinu')
        .addStringOption(option =>
            option.setName('group_size')
                .setDescription('Vyberte velikost skupiny')
                .setRequired(true)
                .addChoices(
                    { name: 'Duo', value: 'Duo' },
                    { name: 'Trio', value: 'Trio' }
                ))
        .addStringOption(option =>
            option.setName('activity')
                .setDescription('Vyberte aktivitu')
                .setRequired(true)
                .addChoices(
                    { name: 'Boss killing', value: 'Boss killing' },
                    { name: 'PVP', value: 'PVP' },
                    { name: 'Chilling', value: 'Chilling' },
                    { name: 'Expení', value: 'Expení' },
                    { name: 'Questy', value: 'Questy' }
                ))
        .addStringOption(option =>
            option.setName('gearscore')
                .setDescription('Vyberte gearscore')
                .addChoices(
                    { name: '0-24', value: '0-24' },
                    { name: '25-124', value: '25-124' },
                    { name: '125+', value: '125+' }
                ))
        .addStringOption(option =>
            option.setName('map')
                .setDescription('Vyberte mapu')
                .addChoices(
                    { name: 'Crypts', value: 'Crypts' },
                    { name: 'Goblin Caves', value: 'Goblin Caves' },
                    { name: 'Ice Cavern', value: 'Ice Cavern' }
                ))
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Vyberte mód')
                .addChoices(
                    { name: 'Normals', value: 'Normals' },
                    { name: 'High Roller', value: 'High Roller' }
                ))
        .addUserOption(option =>
            option.setName('member')
                .setDescription('Vyberte člena'))
        .addStringOption(option =>
            option.setName('comment')
                .setDescription('Přidejte komentář')),
    async execute(interaction) {
        const groupSize = interaction.options.getString('group_size');
        const activity = interaction.options.getString('activity');
        const gearscore = interaction.options.getString('gearscore');
        const map = interaction.options.getString('map');
        const mode = interaction.options.getString('mode');
        const member = interaction.options.getUser('member');
        const comment = interaction.options.getString('comment');

        let imageUrl;
        switch (activity) {
            case 'PVP':
                imageUrl = 'https://gameplay.tips/wp-content/uploads/2024/06/Dark-and-Darker-8-678x381.jpg';
                break;
            case 'Boss killing':
                imageUrl = 'https://darkanddarker.wiki.spellsandguns.com/images/e/e1/Cave_Troll.png';
                break;
            case 'Chilling':
                imageUrl = 'https://oyster.ignimgs.com/mediawiki/apis.ign.com/dark-and-darker/f/f7/Dark-darker-campfire.jpg';
                break;
            case 'Expení':
                imageUrl = 'https://oyster.ignimgs.com/mediawiki/apis.ign.com/dark-and-darker/1/1c/Dark-and-darker.jpg';
                break;
            case 'Questy':
                imageUrl = 'https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/11/dark-and-darker-patch-2-screen.jpg';
                break;
            default:
                imageUrl = '';
        }

        const embed = new EmbedBuilder()
            .setTitle('Hledám Skupinu')
            .addFields(
                { name: 'Velikost Skupiny', value: groupSize, inline: true },
                { name: 'Aktivita', value: activity, inline: true }
            )
            .setImage(imageUrl)
            .setFooter({ text: 'Založ vlastní LFG embed pomocí **/lfg**' });

        if (gearscore) embed.addFields({ name: 'Gearscore', value: gearscore, inline: true });
        if (map) embed.addFields({ name: 'Mapa', value: map, inline: true });
        if (mode) embed.addFields({ name: 'Mód', value: mode, inline: true });
        if (member) embed.addFields({ name: 'Člen', value: member.toString(), inline: true });

        const authorVoiceChannel = interaction.member.voice.channelId;
        if (authorVoiceChannel) {
            embed.addFields({ name: 'Hlasový Kanál', value: `<#${authorVoiceChannel}>`, inline: true });
        }

        if (interaction.member.roles.cache.has('1261645919074521088')) {
            const verification = await Verification.findOne({ where: { discordId: interaction.member.id } });
            if (verification) {
                embed.addFields({ name: 'Account Name', value: verification.accountName, inline: true });
            }
        }

        if (comment) {
            embed.setDescription(comment);
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('delete_lfg')
                    .setLabel('Smazat LFG')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('party_formed')
                    .setLabel('Nalezeno')
                    .setStyle(ButtonStyle.Success)
            );

        const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const filter = i => i.customId === 'delete_lfg' || i.customId === 'party_formed';
        const collector = message.createMessageComponentCollector({ filter, time: 3600000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'Nemáte oprávnění k interakci s tímto tlačítkem.', ephemeral: true });
            }

            if (i.customId === 'delete_lfg') {
                await i.message.delete();
            } else if (i.customId === 'party_formed') {
                const editedEmbed = EmbedBuilder.from(i.message.embeds[0])
                    .setTitle('Skupina Vytvořena');
                await i.update({ embeds: [editedEmbed], components: [] });
            }
        });

        collector.on('end', collected => {
            if (!collected.size) {
                message.edit({ components: [] });
            }
        });
    },
};
