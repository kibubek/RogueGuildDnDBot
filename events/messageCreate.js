module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Check if the message is a system message for pinning
        if (message.type === 6) { // ChannelPinnedMessage type
            try {
                await message.delete();
                console.log('System pin message deleted.');
            } catch (error) {
                console.error('Error deleting system pin message:', error);
            }
        }
    },
};
