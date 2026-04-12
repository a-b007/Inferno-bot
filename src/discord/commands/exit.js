import { getGame, deleteGame } from '../../engine/gameManager.js';
import { buildLeaderboard }    from '../../systems/leaderboard.js';

export async function handleExit(interaction) {
  const game = getGame(interaction.guildId);

  if (!game) {
    return interaction.reply({ content: '❌ No game running.', ephemeral: true });
  }

  await interaction.reply({ content: '🛑 Ending game…', ephemeral: true });

  const reason = `🛑 Game ended early by <@${interaction.user.id}>.`;

  if (game.started && game.players.length > 0) {
    const content = buildLeaderboard(game.players, game.properties, reason);
    await interaction.channel.send({ content, components: [] });
  } else {
    await interaction.channel.send({ content: reason, components: [] });
  }

  deleteGame(interaction.guildId);
}