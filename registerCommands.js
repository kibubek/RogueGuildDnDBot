const { REST, Routes } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { token, clientId, guildId } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Place a coinflip bet')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The item you are betting')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('requesteditem')
                .setDescription('The item you want in return')
                .setRequired(false)),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
