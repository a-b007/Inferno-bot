import { getGame, startGame } from '../../engine/gameManager.js';
import { getRollButton }      from '../components/turnButtons.js';

export async function handleStart(interaction) {
  const game = getGame(interaction.guildId);

  if (!game) {
    return interaction.reply({ content: "❌ No game found.", ephemeral: true });
  }
  if (game.started) {
    return interaction.reply({ content: "⚠️ Game already started.", ephemeral: true });
  }
  if (game.players.length < 2) {
    return interaction.reply({
      content:   "❌ Need at least 2 players to start.",
      ephemeral: true,
    });
  }

  startGame(game);
  const first = game.players[0];

  // Store the turn message so roll.js can edit it in-place
  const msg = await interaction.reply({
    content:
      `🎮 **Inferno** begins! Players: ${game.players.map(p => `<@${p.id}>`).join(", ")}\n\n` +
      `🎰 <@${first.id}>'s turn — press Roll when ready!`,
    components:  getRollButton(first.id),
    fetchReply:  true,
  });

  game.turnMessage = msg;
}