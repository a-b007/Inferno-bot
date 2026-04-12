import { AttachmentBuilder }                      from 'discord.js';
import { getRollButton }                          from '../discord/components/turnButtons.js';
import { getJailButtons }                         from '../discord/components/jailButtons.js';
import { deleteGame, MAX_LAPS }                   from './gameManager.js';
import { renderBoard }                            from '../systems/boardRenderer.js';
import { buildLeaderboard }                       from '../systems/leaderboard.js';

/**
 * Get the channel from the current turn message.
 * Tries game.turnMessage.channel, falls back to interaction.channel.
 */
function getChannel(interaction, game) {
  return game.turnMessage?.channel ?? interaction.channel ?? null;
}

/**
 * Render the board and return the attachment, or null on failure.
 * Passes the full game object — boardRenderer handles undefined safely.
 */
async function makeBoardAttachment(game) {
  try {
    return await renderBoard(game);   // renderBoard(game) — NOT renderBoard(players, props)
  } catch (err) {
    console.error('[boardRenderer] render failed:', err.message);
    return null;
  }
}

/**
 * Send the end-game leaderboard via a fresh channel.send().
 * Deletes the game state before sending so no further moves can occur.
 */
async function sendGameOver(channel, game, reason) {
  const content = buildLeaderboard(game.players, game.properties, reason);
  const file    = await makeBoardAttachment(game);
  deleteGame(channel.guildId ?? channel.guild?.id);
  return channel.send({
    content,
    files:      file ? [file] : [],
    components: [],
  });
}

/**
 * Advance to the next player.
 *
 * KEY FIX FOR BOARD DISAPPEARING:
 *   Discord's message.edit() strips attachments unless you re-upload them.
 *   Instead of editing game.turnMessage, we always send a FRESH message via
 *   channel.send() and update game.turnMessage to point at the new one.
 *   This means the board image is always present on the active turn message.
 *
 * @param {Interaction} interaction
 * @param {object}      game
 * @param {object|null} bankruptPlayer  - if set, ends the game immediately
 */
export async function advanceTurn(interaction, game, bankruptPlayer = null) {
  const channel = getChannel(interaction, game);

  // ── Bankruptcy → game over ─────────────────────────────────────────────────
  if (bankruptPlayer) {
    const reason = `💀 <@${bankruptPlayer.id}> has gone **bankrupt** — the Inferno claims another soul!`;
    if (channel) return sendGameOver(channel, game, reason);
    return interaction.followUp({ content: reason });
  }

  // ── Lap limit → game over ──────────────────────────────────────────────────
  const lapLeader = game.players.find(p => p.laps >= MAX_LAPS);
  if (lapLeader) {
    const reason = `🏁 <@${lapLeader.id}> completed **${MAX_LAPS} laps** — the Inferno is over!`;
    if (channel) return sendGameOver(channel, game, reason);
    return interaction.followUp({ content: reason });
  }

  // ── Normal turn advance ────────────────────────────────────────────────────
  if (!channel) {
    console.error('[advanceTurn] No channel available — cannot post next turn.');
    return;
  }

  game.currentTurn = (game.currentTurn + 1) % game.players.length;
  const next = game.players[game.currentTurn];

  const file = await makeBoardAttachment(game);

  let content, components;
  if (next.inJail) {
    content    = `🔒 <@${next.id}>'s turn — you're in **Jail!**\nPay **150 rep** to escape or roll doubles.\n💼 Balance: **${next.reputation}**  •  🏁 Lap **${next.laps} / ${MAX_LAPS}**`;
    components = getJailButtons(next.id);
  } else {
    content    = `🎰 <@${next.id}>'s turn — press Roll when ready!\n💼 Balance: **${next.reputation}**  •  🏁 Lap **${next.laps} / ${MAX_LAPS}**`;
    components = getRollButton(next.id);
  }

  // Always send a NEW message — never edit the old one — so the board image persists
  const msg = await channel.send({
    content,
    components,
    files: file ? [file] : [],
  });

  game.turnMessage = msg;
}
