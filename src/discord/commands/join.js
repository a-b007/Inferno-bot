import { getGame, addPlayer, MAX_PLAYERS } from '../../engine/gameManager.js';

export async function handleJoin(interaction) {
  const { guildId, user } = interaction;
  const game = getGame(guildId);

  if (!game) {
    return interaction.reply({
      content:   "❌ No game found. Use `/play` to create one.",
      ephemeral: true,
    });
  }

  if (game.started) {
    return interaction.reply({
      content:   "❌ The game has already started.",
      ephemeral: true,
    });
  }

  if (game.players.some(p => p.id === user.id)) {
    return interaction.reply({
      content:   "⚠️ You're already in this game.",
      ephemeral: true,
    });
  }

  const joined = addPlayer(game, user.id);
  if (!joined) {
    return interaction.reply({
      content:   `❌ The game is full (max ${MAX_PLAYERS} players).`,
      ephemeral: true,
    });
  }

  const names = game.players.map(p => `<@${p.id}>`).join(", ");
  return interaction.reply({
    content: `✅ <@${user.id}> joined!\n👥 Players (${game.players.length}/${MAX_PLAYERS}): ${names}`,
  });
}