async function handleCancelMatch(interaction) {
    await interaction.update({ content: 'Call was canceled.', components: [], ephemeral: true });
}

module.exports = handleCancelMatch;