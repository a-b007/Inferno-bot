import { getGame, isBankrupt }              from '../../engine/gameManager.js';
import { drawEventCard, applyEvent,
         calcSideDelta }                    from '../../systems/eventSystem.js';
import { advanceTurn }                      from '../../engine/turnManager.js';
import { getVoteButtons }                   from '../components/voteButtons.js';

const VOTE_WINDOW_MS = 10_000;
const delay = ms => new Promise(r => setTimeout(r, ms));

function fmtDelta(n) {
  if (n > 0) return `+${n}`;
  if (n < 0) return `${n}`;
  return "±0";
}

/**
 * Build the spectator-facing vote message (card details hidden).
 */
function buildVotePrompt(card, activePlayer, sideDelta, secondsLeft, votes, allPlayers) {
  const voterLines = allPlayers
    .filter(p => p.id !== activePlayer.id)
    .map(p => {
      const v = votes.get(p.id);
      return v ? `<@${p.id}>: ${v === 'support' ? '🤝' : v === 'oppose' ? '🗡️' : '🚫'}` : `<@${p.id}>: …`;
    })
    .join("  ");

  return (
    `🃏 **Event card drawn for <@${activePlayer.id}>!**\n` +
    `_The details are hidden until voting ends…_\n\n` +
    `⏱️ **${secondsLeft}s** to vote\n` +
    `🤝 Win the bet → **${fmtDelta(sideDelta)} rep**  |  ` +
    `🗡️ Lose the bet → **${fmtDelta(-sideDelta)} rep**  |  ` +
    `🚫 Skip → no change\n\n` +
    (voterLines ? `Votes: ${voterLines}` : "")
  );
}

/**
 * Build the final result message shown to everyone after voting.
 */
function buildResult(card, activePlayer, spectatorResults) {
  const isGain      = card.delta >= 0;
  const flavour     = isGain ? card.successMsg : card.failureMsg;
  const sign        = isGain ? "💚" : "🔴";

  const specLines = spectatorResults
    .map(r => {
      if (r.vote === 'skip') return `<@${r.id}>: 🚫 skipped`;
      const arrow = r.repChange >= 0 ? "💚" : "🔴";
      return `<@${r.id}>: ${r.vote === 'support' ? '🤝' : '🗡️'} ${arrow} ${fmtDelta(r.repChange)} rep`;
    })
    .join("\n");

  return (
    `${card.emoji} **${card.title}**\n` +
    `_${card.description}_\n\n` +
    `${sign} <@${activePlayer.id}>: **${fmtDelta(card.delta)} rep**  •  Balance: **${activePlayer.reputation}**\n` +
    (specLines ? `\n**Spectator outcomes:**\n${specLines}\n` : "") +
    (flavour ? `\n_"${flavour}"_` : "")
  );
}

/**
 * Run the full event flow:
 *  1. Show vote prompt with buttons (card hidden)
 *  2. Collect votes for VOTE_WINDOW_MS
 *  3. Apply card + spectator deltas
 *  4. Edit turn message in place with result
 *  5. Advance turn
 *
 * @param {Interaction} triggerInteraction  - the roll button interaction
 * @param {object}      game
 * @param {object}      activePlayer
 * @param {string}      rollHeader          - dice line already shown
 */
export async function runEventFlow(triggerInteraction, game, activePlayer, rollHeader) {
  const card      = drawEventCard();
  const sideDelta = calcSideDelta(card);
  const votes     = new Map();   // playerId → 'support' | 'oppose' | 'skip'
  const allPlayers = game.players;

  // ── Step 1: Edit the turn message to show the vote prompt ──
  

  const buildPrompt = (secs) =>
    buildVotePrompt(card, activePlayer, sideDelta, secs, votes, allPlayers);

  await game.turnMessage.edit({
    content:    `${rollHeader}\n\n${buildPrompt(10)}`,
    components: getVoteButtons(activePlayer.id),
  });

  // ── Step 2: Collect votes via a collector + countdown edits ──
  // We run a countdown that re-edits every 2.5s and resolves after VOTE_WINDOW_MS.
  const countdownIntervals = [7, 5, 3, 1];
  let   countdownIdx       = 0;

  const countdownTimer = setInterval(async () => {
    const secs = countdownIntervals[countdownIdx++];
    if (secs === undefined) return;
    try {
      await game.turnMessage.edit({
        content:    `${rollHeader}\n\n${buildPrompt(secs)}`,
        components: getVoteButtons(activePlayer.id),
      });
    } catch { /* message may already be resolved */ }
  }, 2500);

  // Store a pending vote handler on the game so interactionHandler can route to it
  game.pendingVote = {
    activePlayerId: activePlayer.id,
    votes,
  };

  // ── Step 3: Resolve after window ──
  await delay(VOTE_WINDOW_MS);
  clearInterval(countdownTimer);
  game.pendingVote = null;

  // ── Step 4: Apply and show result ──
  const { spectatorResults } = applyEvent(card, activePlayer, allPlayers, votes);

  await game.turnMessage.edit({
    content:    `${rollHeader}\n\n${buildResult(card, activePlayer, spectatorResults)}`,
    components: [],
  });

  // ── Step 5: Check bankruptcy and advance ──
  const bankrupt = isBankrupt(activePlayer) ? activePlayer : null;
  // We pass null as interaction since the original interaction is already deferred —
  // advanceTurn only needs it for followUp, which works on deferred interactions.
  return advanceTurn(triggerInteraction, game, bankrupt);
}

/**
 * Handle a spectator pressing a vote button.
 * Called from interactionHandler when customId starts with "vote_".
 */
export async function handleVote(interaction) {
  const game = getGame(interaction.guildId);

  if (!game?.pendingVote) {
    return interaction.reply({ content: "⏱️ Voting has already closed.", ephemeral: true });
  }

  const { activePlayerId, votes } = game.pendingVote;
  const parts  = interaction.customId.split("_"); // ['vote', 'support'|'oppose'|'skip', playerId]
  const choice = parts[1];
  const userId = interaction.user.id;

  // Active player cannot vote on their own event
  if (userId === activePlayerId) {
    return interaction.reply({ content: "🎭 You can't vote on your own event!", ephemeral: true });
  }

  // Must be a player in the game
  if (!game.players.some(p => p.id === userId)) {
    return interaction.reply({ content: "❌ You're not in this game.", ephemeral: true });
  }

  // One vote per player
  if (votes.has(userId)) {
    return interaction.reply({ content: "✅ You've already voted.", ephemeral: true });
  }

  votes.set(userId, choice);

  const label = choice === 'support' ? '🤝 Support' : choice === 'oppose' ? '🗡️ Oppose' : '🚫 Skip';
  return interaction.reply({
    content:   `${label} — vote recorded! Results revealed when voting closes.`,
    ephemeral: true,
  });
}