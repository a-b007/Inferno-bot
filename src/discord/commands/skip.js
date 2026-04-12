export async function handleSkip(interaction) {
  const game = getGame(interaction.guildId);

  await interaction.update({
    content: "Skipped purchase.",
    components: []
  });

  advanceTurn(interaction, game);
}