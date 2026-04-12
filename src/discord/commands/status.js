import { getGame }  from '../../engine/gameManager.js';
import { board }    from '../../engine/board.js';

export async function handleStatus(interaction) {
  const game = getGame(interaction.guildId);

  if (!game) {
    return interaction.reply({ content: "❌ No game running.", ephemeral: true });
  }

  const lines = game.players.map((p, i) => {
    const tile   = board[p.position];
    const active = i === game.currentTurn ? " ← current turn" : "";
    const jail   = p.inJail ? " 🔒" : "";
    return `<@${p.id}>${jail}${active}\n  💰 ${p.reputation} rep  •  📍 ${tile.name} (tile ${p.position})`;
  });

  // Count properties per player
  const owned = {};
  for (const [pos, pid] of Object.entries(game.properties)) {
    owned[pid] = (owned[pid] ?? 0) + 1;
  }
  const propLines = game.players.map(p =>
    `<@${p.id}>: ${owned[p.id] ?? 0} propert${owned[p.id] === 1 ? "y" : "ies"}`
  );

  return interaction.reply({
    ephemeral: true,
    content:
      `📊 **Game Status**\n\n` +
      lines.join("\n\n") +
      `\n\n🏠 **Properties Owned**\n` +
      propLines.join("\n"),
  });
}