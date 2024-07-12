const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { token, clientId, guildId, GAMBA_CHANNEL_ID, NEWCOMMER_CHANNEL_ID, SHERPA_APPLICATIONS_CHANNEL_ID } = require('./config.json');
const fs = require('fs');
const { sendWelcomeMessage } = require('./utils/sendWelcomeMessage');

const handleAccept = require('./interactions/handleButton/accept');
const handleCounterOffer = require('./interactions/handleButton/counterOffer');
const handleDeny = require('./interactions/handleButton/deny');
const handleDelete = require('./interactions/handleButton/delete');
const handleModal = require('./interactions/handleModal');
const handleMatchBet = require('./interactions/handleButton/handleMatchBet');
const handleCancelMatch = require('./interactions/handleButton/handleCancelMatch');
const handleConfirmMatch = require('./interactions/handleButton/handleConfirmMatch');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
client.modals = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Load modals
const modalFiles = fs.readdirSync('./interactions').filter(file => file.startsWith('handle')).filter(file => file.endsWith('.js'));

for (const file of modalFiles) {
    const modal = require(`./interactions/${file}`);
    client.modals.set(modal.customId, modal);
}

// Load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once('ready', async () => {
    console.log(`Přihlášen jako ${client.user.tag}!`);

    // Register slash commands
    const rest = new REST({ version: '10' }).setToken(token);

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
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) {
            await command.execute(interaction);
        }
    } else if (interaction.isButton()) {
        const [action] = interaction.customId.split('_');
        if (action === 'accept') {
            await handleAccept(interaction, client, GAMBA_CHANNEL_ID);
        } else if (action === 'counteroffer') {
            await handleCounterOffer(interaction);
        } else if (action === 'deny') {
            await handleDeny(interaction);
        } else if (action === 'deletebet') {
            await handleDelete(interaction);
        } else if (action === 'matchbet') {
            await handleMatchBet(interaction);
        } else if (action === 'confirmmatch') {
            await handleConfirmMatch(client, interaction);
        } else if (action === 'cancelmatch') {
            await handleCancelMatch(interaction);
        }
    } else if (interaction.isModalSubmit()) {
        await handleModal(interaction, client);
    }
});
client.on('guildMemberAdd', member => {
    sendWelcomeMessage(member, NEWCOMMER_CHANNEL_ID);
});

client.login(token);
