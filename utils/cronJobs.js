const cron = require('node-cron');

function scheduleDeleteOldPinnedMessages(client, guildId, channelName) {
    cron.schedule('0 * * * *', async () => {
        console.log('Running scheduled task to delete old pinned messages.');
        const guild = await client.guilds.fetch(guildId);
        const channel = guild.channels.cache.find(ch => ch.id === channelName);

        if (!channel) {
            console.log('Channel not found');
            return;
        }

        const now = new Date();
        const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));

        const messages = await channel.messages.fetchPinned();
        messages.forEach(message => {
            if (message.createdAt < threeDaysAgo) {
                message.delete()
                    .then(() => console.log(`Deleted message from ${message.createdAt}`))
                    .catch(console.error);
            }
        });
    });

    console.log('Cron job scheduled.');
}

module.exports = { scheduleDeleteOldPinnedMessages };
