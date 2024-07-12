const { ModalSubmitInteraction, EmbedBuilder } = require('discord.js');
const { SHERPA_APPLICATIONS_CHANNEL_ID } = require('../config.json');

module.exports = {
    customId: 'sherpa-application-modal',
    type: 'modal',
    /**
     * 
     * @param {Client} client 
     * @param {ModalSubmitInteraction} interaction 
     */
    async run(client, interaction) {
        // Defer the reply to ensure interaction is acknowledged promptly
        await interaction.deferReply({ ephemeral: true });

        const answer1 = interaction.fields.getTextInputValue('sherpa-answer-1');
        const answer2 = interaction.fields.getTextInputValue('sherpa-answer-2');
        const answer3 = interaction.fields.getTextInputValue('sherpa-answer-3');
        const answer4 = interaction.fields.getTextInputValue('sherpa-answer-4');
        const answer5 = interaction.fields.getTextInputValue('sherpa-answer-5');

        async function sendAnswersEmbed(answers) {
            const embed = new EmbedBuilder()
                .setTitle('Žádost o šerpu')
                .setDescription(`Zažádal si <@${interaction.user.id}> o šerpu.`)
                .setColor('#FFA500'); // Orange color, you can change it as per your preference

            // Add each answer as a field in the embed
            for (const [key, value] of Object.entries(answers)) {
                embed.addFields({ name: key, value: value, inline: false }); // inline=false for each field on a new line
            }

            // Fetch the channel and send the embed
            const channel = await client.channels.fetch(SHERPA_APPLICATIONS_CHANNEL_ID);
            await channel.send({ embeds: [embed] });
        }

        // Extract answers from the interaction options (assuming they are provided as option values)
        const answersFromModal = {
            'Kolik máš nahraných hodin v DnD?': answer1,
            'Tvůj věk?': answer2,
            'Jaký bys měl postup zaučení nového hráče?': answer3,
            'Umíš dodgovat všechny mobky?': answer4,
            'Na závěr se nám trošku popiš': answer5
        };

        // Call the function to send the embed with the answers
        await sendAnswersEmbed(answersFromModal);

        // Reply to the interaction after processing
        await interaction.editReply({ content: 'Žádost o šerpu byla odeslána.' });
    }
};
