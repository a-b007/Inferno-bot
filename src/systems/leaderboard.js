/**
 * leaderboard.js
 * Builds the end-game leaderboard string shown when the game ends.
 */
import { totalAssets } from '../engine/gameManager.js';
import { board }       from '../engine/board.js';

const MEDALS     = ['🥇', '🥈', '🥉', '💀', '💀'];
const RANK_LINES = ['**WINNER**', '2nd Place', '3rd Place', '4th Place', '5th Place'];

// Flavour lines per rank
const FLAVOUR = [
  'The Strip bows to you.',
  'Close — but the house always wins.',
  'Not bad for a first-timer.',
  'Better luck next lifetime.',
  'Even the valet felt bad for you.',
];

export function buildLeaderboard(players, properties, reason = 'The game has ended.') {
  // Sort by total assets descending
  const ranked = [...players]
    .map(p => ({
      ...p,
      assets: totalAssets(p, properties, board),
      propValue: totalAssets(p, properties, board) - p.reputation,
    }))
    .sort((a, b) => b.assets - a.assets);

  const rows = ranked.map((p, i) => {
    const bar = buildBar(p.assets, ranked[0].assets);
    return [
      `${MEDALS[i]} **${RANK_LINES[i]}** — <@${p.id}>`,
      `> ${bar}`,
      `> 💵 Cash: **${p.reputation}**  🏠 Properties: **${p.propValue}**  ⚖️ Total: **${p.assets}**`,
      `> 🏁 Laps: **${p.laps ?? 0}**  _${FLAVOUR[i]}_`,
    ].join('\n');
  });

  return [
    `## 🔥 INFERNO — FINAL STANDINGS(REPUTATION-O-METER)`,
    `_${reason}_`,
    ``,
    rows.join('\n\n'),
  ].join('\n');
}

/** Simple ASCII progress bar relative to the leader's total assets */
function buildBar(value, max) {
  const FILLED  = '█';
  const EMPTY   = '░';
  const LEN     = 12;
  const filled  = max > 0 ? Math.round((value / max) * LEN) : 0;
  return FILLED.repeat(filled) + EMPTY.repeat(LEN - filled);
}