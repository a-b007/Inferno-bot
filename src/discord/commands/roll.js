import {
  getGame, movePlayer, teleportToJail,
  isBankrupt, JAIL_BAIL, releaseFromJail, SLOT_COST,
} from '../../engine/gameManager.js';
import { board, JAIL_POSITION }   from '../../engine/board.js';
import { rollDice }               from '../../engine/dice.js';
import { advanceTurn }            from '../../engine/turnManager.js';
import { spinSlot }               from '../../systems/slotSystem.js';
import { runEventFlow }           from './eventHandler.js';
import { getPropertyButtons }     from '../components/propertyButtons.js';
import { getJailButtons }         from '../components/jailButtons.js';
import { getSlotButtons }         from '../components/slotButtons.js';
import { getRollButton }          from '../components/turnButtons.js';
import { TILE_TYPES }             from '../../types/Tile.js';

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDelta(n) { return n > 0 ? `+${n}` : `${n}`; }
function lapLine(laps) { return `🏁 Lap **${laps} / 4**`; }

const delay      = ms => new Promise(r => setTimeout(r, ms));
const SPIN_REELS = ['🍒','🍋','🍊','🍇','⭐','💎','7️⃣','🔔'];
const rand       = () => SPIN_REELS[Math.floor(Math.random() * SPIN_REELS.length)];

async function animateSlot(game, result, header) {
  for (let i = 0; i < 4; i++) {
    await delay(550);
    const isLast  = i === 3;
    const reelStr = isLast
      ? `**[ ${result.reels[0]} | ${result.reels[1]} | ${result.reels[2]} ]**`
      : `[ ${rand()} | ${rand()} | ${rand()} ]`;
    await game.turnMessage.edit({
      content:
        `${header}\n🎰 ${isLast ? '' : 'Spinning... '}${reelStr}` +
        (isLast
          ? `\n${result.msg}\n💼 ${fmtDelta(result.delta)} rep  •  Balance: **${result.balance}**`
          : ''),
      components: [],
    });
  }
}

// ── SLOT BUTTON HANDLERS ──────────────────────────────────────────────────────

export async function handleSlotSpin(interaction) {
  const game   = getGame(interaction.guildId);
  const player = game?.players[game.currentTurn];

  if (!game?.started) return interaction.reply({ content: '❌ No active game.', ephemeral: true });
  if (interaction.user.id !== player.id) return interaction.reply({ content: '⏳ Not your turn!', ephemeral: true });

  await interaction.reply({ content: '🎰 Spinning…', ephemeral: true });

  if (player.reputation < SLOT_COST) {
    await game.turnMessage.edit({
      content:   `❌ <@${player.id}> can't afford to spin (costs **${SLOT_COST}**, balance: **${player.reputation}**).`,
      components: [],
    });
    return advanceTurn(interaction, game);
  }

  // Deduct spin cost first, then spin
  player.reputation -= SLOT_COST;
  const header = game.turnMessage.content?.split('\n')[0] ?? '🎰 Slot Machine';

  const result   = spinSlot(player);
  result.balance = player.reputation;
  await animateSlot(game, result, `${header}\n💸 Paid **${SLOT_COST} rep** to spin`);
  return advanceTurn(interaction, game, isBankrupt(player) ? player : null);
}

export async function handleSlotSkip(interaction) {
  const game   = getGame(interaction.guildId);
  const player = game?.players[game.currentTurn];

  if (!game?.started) return interaction.reply({ content: '❌ No active game.', ephemeral: true });
  if (interaction.user.id !== player.id) return interaction.reply({ content: '⏳ Not your turn!', ephemeral: true });

  await interaction.reply({ content: '⏭️ Skipping slot…', ephemeral: true });
  await game.turnMessage.edit({ content: `⏭️ <@${player.id}> walked past the slot machine.`, components: [] });
  return advanceTurn(interaction, game);
}

// ── JAIL HANDLERS ─────────────────────────────────────────────────────────────

export async function handleJailPay(interaction) {
  const game   = getGame(interaction.guildId);
  const player = game?.players[game.currentTurn];

  if (!game?.started) return interaction.reply({ content: '❌ No active game.', ephemeral: true });
  if (interaction.user.id !== player.id) return interaction.reply({ content: '⏳ Not your turn!', ephemeral: true });

  await interaction.reply({ content: '💸 Paying bail…', ephemeral: true });

  if (player.reputation < JAIL_BAIL) {
    await game.turnMessage.edit({
      content:    `❌ <@${player.id}> can't afford bail (costs **${JAIL_BAIL}**, balance: **${player.reputation}**). Must roll for doubles.`,
      components: getJailButtons(player.id),
    });
    return;
  }

  player.reputation -= JAIL_BAIL;
  releaseFromJail(player);

  await game.turnMessage.edit({
    content:
      `💸 <@${player.id}> paid **${JAIL_BAIL} rep** bail and walked free!\n` +
      `💼 Balance: **${player.reputation}**\n\n🎲 Now roll to move.`,
    components: getRollButton(player.id),
  });
}

export async function handleJailRoll(interaction) {
  const game   = getGame(interaction.guildId);
  const player = game?.players[game.currentTurn];

  if (!game?.started) return interaction.reply({ content: '❌ No active game.', ephemeral: true });
  if (interaction.user.id !== player.id) return interaction.reply({ content: '⏳ Not your turn!', ephemeral: true });

  await interaction.reply({ content: '🎲 Rolling for doubles…', ephemeral: true });

  const { d1, d2, total } = rollDice();

  if (d1 === d2) {
    releaseFromJail(player);
    const { passedGO, lap } = movePlayer(player, total, board.length);
    const tile   = board[player.position];
    const header =
      `🎲 <@${player.id}> rolled **${d1} + ${d2} = ${total}** — 🎉 **DOUBLES! Escaped Jail!**` +
      (passedGO ? `  ✨ *Passed GO! +50 rep*` : '') +
      `\n📍 Landed on: **${tile.name}**  •  ${lapLine(lap)}`;

    await game.turnMessage.edit({ content: header, components: [] });
    return resolveTile(interaction, game, player, tile, header);
  } else {
    await game.turnMessage.edit({
      content:
        `🎲 <@${player.id}> rolled **${d1} + ${d2} = ${total}** — no doubles. Still in Jail.\n` +
        `💼 Balance: **${player.reputation}**`,
      components: [],
    });
    return advanceTurn(interaction, game);
  }
}

// ── MAIN ROLL HANDLER ─────────────────────────────────────────────────────────

export async function handleRoll(interaction) {
  const game   = getGame(interaction.guildId);
  const player = game?.players[game.currentTurn];

  if (!game?.started) return interaction.reply({ content: '❌ No active game.', ephemeral: true });
  if (interaction.user.id !== player.id) return interaction.reply({ content: '⏳ It\'s not your turn!', ephemeral: true });
  if (player.inJail) return interaction.reply({ content: '🔒 You\'re in jail! Use the jail options above.', ephemeral: true });

  await interaction.reply({ content: '🎲 Rolling…', ephemeral: true });

  const { d1, d2, total }  = rollDice();
  const { passedGO, lap }  = movePlayer(player, total, board.length);
  const tile               = board[player.position];

  const rollLine =
    `🎲 <@${player.id}> rolled **${d1} + ${d2} = ${total}**` +
    (passedGO ? `  ✨ *Passed GO! +50 rep*` : '');
  const header = `${rollLine}\n📍 Landed on: **${tile.name}**  •  ${lapLine(lap)}`;

  await game.turnMessage.edit({ content: header, components: [] });

  return resolveTile(interaction, game, player, tile, header);
}

// ── TILE RESOLVER ─────────────────────────────────────────────────────────────

async function resolveTile(interaction, game, player, tile, header) {

  if (tile.type === TILE_TYPES.START) {
    await game.turnMessage.edit({
      content:    `${header}\n✨ Landed on GO! +50 rep  •  Balance: **${player.reputation}**`,
      components: [],
    });
    return advanceTurn(interaction, game);
  }

  if (tile.type === TILE_TYPES.JAIL) {
    await game.turnMessage.edit({
      content:    `${header}\n🔒 Just visiting Jail. Nothing happens.`,
      components: [],
    });
    return advanceTurn(interaction, game);
  }

  if (tile.type === TILE_TYPES.GO_TO_JAIL) {
    teleportToJail(player, JAIL_POSITION);
    await game.turnMessage.edit({
      content:    `${header}\n🚔 Busted! Sent directly to Jail.`,
      components: [],
    });
    return advanceTurn(interaction, game);
  }

  if (tile.type === TILE_TYPES.FREE_PARKING) {
    await game.turnMessage.edit({
      content:    `${header}\n🅿️ Free Parking! Nothing happens — enjoy the rest.`,
      components: [],
    });
    return advanceTurn(interaction, game);
  }

  // SLOT — show spin/skip buttons, player decides
  if (tile.type === TILE_TYPES.SLOT) {
    await game.turnMessage.edit({
      content:
        `${header}\n` +
        `🎰 **Slot Machine!** Spin for **${SLOT_COST} rep** — or walk away.\n` +
        `💼 Your balance: **${player.reputation}**`,
      components: getSlotButtons(player.id),
    });
    return; // wait for slot_spin_ or slot_skip_ button
  }

  if (tile.type === TILE_TYPES.EVENT) {
    return runEventFlow(interaction, game, player, header);
  }

  if (tile.type === TILE_TYPES.PROPERTY) {
    const ownerId = game.properties[player.position];

    if (!ownerId) {
      await game.turnMessage.edit({
        content:
          `${header}\n` +
          `💰 **For sale:** ${tile.price} rep  |  Rent: ${tile.rent} rep\n` +
          `💼 Your balance: **${player.reputation}**`,
        components: getPropertyButtons(player.position),
      });
      return;
    }

    if (ownerId === player.id) {
      await game.turnMessage.edit({
        content:    `${header}\n🏠 You own **${tile.name}**. Nothing to pay.`,
        components: [],
      });
      return advanceTurn(interaction, game);
    }

    const owner = game.players.find(p => p.id === ownerId);
    player.reputation -= tile.rent;
    owner.reputation  += tile.rent;

    await game.turnMessage.edit({
      content:
        `${header}\n` +
        `💸 Paid **${tile.rent} rep** rent to <@${owner.id}>\n` +
        `💼 Your balance: **${player.reputation}**  •  <@${owner.id}>: **${owner.reputation}**`,
      components: [],
    });
    return advanceTurn(interaction, game, isBankrupt(player) ? player : null);
  }

  await game.turnMessage.edit({ content: header, components: [] });
  return advanceTurn(interaction, game);
}