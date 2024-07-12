async function handleCancelMatch(interaction) {
    await interaction.update({ content: 'Dorovnání bylo zrušeno.', components: [], ephemeral: true });
}

module.exports = handleCancelMatch;