
/**
 * Event System
 * ------------
 * Each card has:
 *   title, description, delta, emoji
 *   successMsg  — cheeky line shown when player gains rep
 *   failureMsg  — cheeky line shown when player loses rep
 *
 * Spectator vote logic (20% of |delta|, rounded):
 *   GAIN event  → supporters +sideDelta, opposers -sideDelta
 *   LOSS event  → supporters -sideDelta, opposers +sideDelta
 */

export const EVENT_CARDS = [
  {
    title:       '"Hush Money" Payment',
    description: "A witness saw something they shouldn't have at The Flamingo. Buy their silence.",
    delta:       -100,
    emoji:       "🤫",
    failureMsg:  "Turns out silence isn't cheap. At least the witness looked grateful.",
    successMsg:  null,
  },
  {
    title:       "Smuggling Bonus",
    description: "You utilized a hidden tunnel under the Strip to move illicit goods past the police. Gain $150.",
    delta:       150,
    emoji:       "🕳️",
    successMsg:  "Tunnels: not just for the Vegas monorail anymore.",
    failureMsg:  null,
  },
  {
    title:       "Elvis Presley Look-Alike Contest Winner!",
    description: "Your performance at the Vegas Chapel was legendary. The crowd threw tips! Collect $50 from the bank.",
    delta:       50,
    emoji:       "🎸",
    successMsg:  "Thank you. Thank you very much.",
    failureMsg:  null,
  },
  {
    title:       'Lucky "Black 22"!',
    description: "Your last-minute bet on the roulette wheel at Rio pays off. Collect $175 from the bank.",
    delta:       175,
    emoji:       "🎡",
    successMsg:  "The wheel spun. The crowd gasped. You winked.",
    failureMsg:  null,
  },
  {
    title:       'The "Desert Ride" Fee',
    description: "You were taken for a \"one-way ride\" to the outskirts of town to discuss your debts. You survived, but they took your jewelry. Lose $200.",
    delta:       -200,
    emoji:       "🚗",
    failureMsg:  "The good news: you still have all your fingers.",
    successMsg:  null,
  },
  {
    title:       'Busted for "Cleaning" Cash',
    description: "Federal agents tracked your money laundering scheme at the MGM Grand. Pay a fine of $180.",
    delta:       -180,
    emoji:       "🚨",
    failureMsg:  "The Feds don't take Venmo. Painful lesson.",
    successMsg:  null,
  },
  {
    title:       "Hit the Jackpot!",
    description: "Your number came up on the progressive slots. Collect $200 from the bank.",
    delta:       200,
    emoji:       "🎰",
    successMsg:  "The lights flashed. The bells rang. You played it cool.",
    failureMsg:  null,
  },
  {
    title:       "Caught Counting Cards!",
    description: "You were spotted by the pit boss at Planet Hollywood. The house is claiming your winnings. Pay $150.",
    delta:       -150,
    emoji:       "🃏",
    failureMsg:  "Next time, maybe don't mouth the count out loud.",
    successMsg:  null,
  },
  {
    title:       "Double Down Disaster!",
    description: "The dealer pulled a 21 on your Golden Nugget high-stakes table. Lose $100.",
    delta:       -100,
    emoji:       "💸",
    failureMsg:  "Doubling down felt right. It wasn't.",
    successMsg:  null,
  },
  {
    title:       "The Snitch's Toll",
    description: "Word on the street is you've been talking to the Feds. To restore your \"reputation,\" you must pay a tribute. Lose $130.",
    delta:       -130,
    emoji:       "🐀",
    failureMsg:  "Omertà isn't just a word. It's a bill.",
    successMsg:  null,
  },
  {
    title:       "Evidence Disposal",
    description: "You need to pay a \"cleaner\" to make certain problems at the Stardust disappear. Lose $110.",
    delta:       -110,
    emoji:       "🧹",
    failureMsg:  "Some stains don't come out for free.",
    successMsg:  null,
  },
  {
    title:       "Vegas Night Club Cover Charge!",
    description: "You were at Marquee Night Club and got hit with a surprise fee. Pay $50.",
    delta:       -50,
    emoji:       "🪩",
    failureMsg:  "The bouncer was very apologetic. The bill was not.",
    successMsg:  null,
  },
  {
    title:       'A "Quick" Wedding at the Tunnel of Love!',
    description: "It was the best idea you had at 3:00 AM. It turns out, that annulments aren't free. Pay $150.",
    delta:       -150,
    emoji:       "💍",
    failureMsg:  "What happens in Vegas... still costs $150 to undo.",
    successMsg:  null,
  },
  {
    title:       "The King of Vegas",
    description: "You were just recognized as the best \"showgirl\" on the Linq Promenade. Collect a $100 prize from the bank.",
    delta:       100,
    emoji:       "👑",
    successMsg:  "The feathers. The heels. The rep. All earned.",
    failureMsg:  null,
  },
  {
    title:       "Protection Money Due",
    description: "The \"Outfit\" sent a collector to your door. Pay up to keep your properties standing. Pay $150.",
    delta:       -150,
    emoji:       "🔫",
    failureMsg:  "They were polite about it. That somehow made it worse.",
    successMsg:  null,
  },
  {
    title:       "Street Pharmacist Profits",
    description: "Your side hustle in the back alleys of Fremont Street had a busy weekend. Collect $80.",
    delta:       80,
    emoji:       "💊",
    successMsg:  "Supply. Demand. Discretion. Classic.",
    failureMsg:  null,
  },
  {
    title:       "Vegas High Roller Buffet!",
    description: "You were mistakenly invited to a private banquet. The \"complementary\" meal wasn't free. Pay $75.",
    delta:       -75,
    emoji:       "🍤",
    failureMsg:  "The lobster was incredible. The invoice, less so.",
    successMsg:  null,
  },
];

/**
 * Draw a random event card WITHOUT applying it yet.
 * Application happens after the voting window closes.
 * @returns {EventCard}
 */
export function drawEventCard() {
  return EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
}

/**
 * Calculate the side-bet amount spectators win/lose (20% of |delta|, min 10).
 */
export function calcSideDelta(card) {
  return Math.max(10, Math.round(Math.abs(card.delta) * 0.2));
}

/**
 * Apply the card to all players based on their votes.
 *
 * @param {object}   card
 * @param {object}   activePlayer   - the player who landed on the event tile
 * @param {object[]} allPlayers     - all players in the game
 * @param {Map}      votes          - Map<playerId, 'support'|'oppose'|'skip'>
 * @returns {{ activeRepChange: number, spectatorResults: {id, vote, repChange}[] }}
 */
export function applyEvent(card, activePlayer, allPlayers, votes) {
  const sideDelta = calcSideDelta(card);
  const isGain    = card.delta >= 0;

  // Apply to active player
  activePlayer.reputation += card.delta;

  // Apply to spectators
  const spectatorResults = [];
  for (const player of allPlayers) {
    if (player.id === activePlayer.id) continue;
    const vote = votes.get(player.id) ?? 'skip';

    let repChange = 0;
    if (vote !== 'skip') {
      // supporter of a GAIN  → +side   |  supporter of a LOSS  → -side
      // opposer  of a GAIN  → -side   |  opposer  of a LOSS   → +side
      const supportSign = isGain ? 1 : -1;
      repChange = vote === 'support' ? supportSign * sideDelta : -supportSign * sideDelta;
      player.reputation += repChange;
    }

    spectatorResults.push({ id: player.id, vote, repChange });
  }

  return { activeRepChange: card.delta, spectatorResults };
}