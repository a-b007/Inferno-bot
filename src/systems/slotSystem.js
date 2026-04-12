/**
 * Slot Machine System
 * -------------------
 * Uses a weighted tier table to determine outcome.
 *
 * Tiers (weights must sum to 100):
 *   JACKPOT   5%   +300        fixed
 *   BIG_WIN  10%   +150        fixed
 *   WIN      20%   +75         fixed
 *   PUSH     25%    0          fixed
 *   LOSS     20%   -75         fixed
 *   BIG_LOSS 14%   -150        fixed
 *   RUINOUS   6%   -(all rep)  dynamic — wipes the player's entire balance
 *
 * For static tiers:   set `delta` to a number, `dynamicDelta` to null.
 * For dynamic tiers:  set `delta` to null,     `dynamicDelta` to a fn(player) => number.
 */

const REELS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🔔'];

// ── helpers ───────────────────────────────────────────────────────────────────

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandom(tiers) {
  const total = tiers.reduce((s, t) => s + t.weight, 0);
  let roll    = Math.random() * total;

  for (const tier of tiers) {
    roll -= tier.weight;
    if (roll <= 0) return tier;
  }

  return tiers[tiers.length - 1];
}

function randomReel() {
  return REELS[Math.floor(Math.random() * REELS.length)];
}

function buildReelDisplay(tier) {
  if (tier.reels) return tier.reels;

  // WIN → two matching + one different
  if (tier.label === 'WIN') {
    const match = randomReel();
    let other = randomReel();
    while (other === match) other = randomReel();
    return [match, match, other];
  }

  // Everything else → three randoms (avoid accidental triple match)
  const r = [randomReel(), randomReel(), randomReel()];
  while (new Set(r).size === 1) r[2] = randomReel();

  return r;
}

// ── tiers ─────────────────────────────────────────────────────────────────────

const TIERS = [
  {
    label: 'JACKPOT',
    weight: 5,
    delta: 300,
    dynamicDelta: null,
    reels: ['💎', '💎', '💎'],
    msg: [
        "💎 **JACKPOT.** The machine yields. For a moment, the world rearranges itself in your favor. You will remember this as proof you deserve it.",
    "💎 **JACKPOT.** A perfect alignment. Probability bends, briefly, like it knows your name. It won’t last.",
    "💎 **JACKPOT.** The sound is almost holy. Coins, light, validation. You mistake it for destiny."
    ],
  },
  {
    label: 'BIG_WIN',
    weight: 10,
    delta: 150,
    dynamicDelta: null,
    reels: ['7️⃣', '7️⃣', '7️⃣'],
    msg: [
        "7️⃣ **Big Win.** Not quite transcendence, but close enough to make you reckless.",
        "7️⃣ **Big Win.** The numbers climb. You feel taller. This is how it starts.",
        "7️⃣ **Big Win.** A convincing illusion of control settles in. You accept it immediately."
    ],
  },
  {
    label: 'WIN',
    weight: 20,
    delta: 75,
    dynamicDelta: null,
    reels: null,
    msg: [
    "⭐ **Win.** Just enough to keep the narrative alive. You are still 'in it.'",
    "⭐ **Win.** A small success. You inflate it carefully, like a fragile ego.",
    "⭐ **Win.** The machine nods at you. Encouragement, or bait—it's hard to tell."
    ],
  },
  {
    label: 'PUSH',
    weight: 25,
    delta: 0,
    dynamicDelta: null,
    reels: null,
    msg: [
     "🔔 **Push.** Nothing changes. You remain exactly where you were—dangerously comfortable.",
     "🔔 **Push.** A pause. The game inhales. You mistake it for mercy.",
     "🔔 **Push.** No loss, no gain. Just time slipping quietly past you."
    ],
  },
  {
    label: 'LOSS',
    weight: 20,
    delta: -75,
    dynamicDelta: null,
    reels: null,
    msg: [
    "🍋 **Loss.** A minor correction. The universe adjusts your expectations downward.",
    "🍋 **Loss.** You feel it, but not enough to stop. That's the problem.",
    "🍋 **Loss.** The machine takes. You rationalize. A well-rehearsed exchange."
    ],
  },
  {
    label: 'BIG_LOSS',
    weight: 14,
    delta: -150,
    dynamicDelta: null,
    reels: null,
    msg: [
    "💸 **Big Loss.** The numbers drop fast enough to feel real. You notice, finally.",
    "💸 **Big Loss.** Something tightens in your chest. Not enough to quit. Never enough.",
    "💸 **Big Loss.** The illusion cracks, just slightly. You look away before it widens."
    ],
  },
  {
    label: 'RUINOUS',
    weight: 6,
    delta: null,
    dynamicDelta: (player) => -player.reputation + 1,
    reels: ['💥', '💥', '💥'],
    msg: [
      " **RUINOUS.** The reels stop. Something inside you stops with them. There is a smell—burnt circuitry, or is it you?",
      " **RUINOUS.** And just like that, your grand fortune evaporates. You stand there, staring, as if disbelief might undo it. It will not.",
      " **RUINOUS.** Ah. There it goes. All that money, all that swagger—reduced to a faint memory and a smoking machine. One almost feels sorry for you.",
      " **RUINOUS.** Of course it ends like this. It was always going to. The money, the brief illusion of control—it slips through your fingers without resistance. You stand there anyway, as if bearing witness might grant it meaning.",
    ],
  },
];

// ── public API ────────────────────────────────────────────────────────────────

/**
 * Spin the slot machine for a player.
 * Mutates player.reputation.
 *
 * @param   {object} player  - must have .reputation
 * @returns {{ reels: string[], tier: string, delta: number, msg: string }}
 */
export function spinSlot(player) {
  const tier = weightedRandom(TIERS);

  // Resolve delta
  const delta = tier.delta !== null
    ? tier.delta
    : tier.dynamicDelta(player);

  const reels = buildReelDisplay(tier);

  // Apply result
  player.reputation += delta;

  // Resolve message (supports array or string)
  const msg = Array.isArray(tier.msg)
    ? pickRandom(tier.msg)
    : tier.msg;

  return {
    reels,
    tier:  tier.label,
    delta,
    msg,
  };
}