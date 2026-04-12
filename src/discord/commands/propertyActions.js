import { getGame, isBankrupt } from '../../engine/gameManager.js';
import { board }               from '../../engine/board.js';
import { advanceTurn }         from '../../engine/turnManager.js';

async function editTurnMessage(interaction, game, data) {
  try {
    if (game.turnMessage) return await game.turnMessage.edit(data);
    return await interaction.update(data);
  } catch {
    return await interaction.update(data);
  }
}

export async function handleBuy(interaction) {
  const game   = getGame(interaction.guildId);
  const player = game?.players[game.currentTurn];

  if (!game) return interaction.update({ content: "❌ No active game.", components: [] });

  if (interaction.user.id !== player.id) {
    return interaction.reply({ content: "⏳ It's not your turn!", ephemeral: true });
  }

  // Acknowledge the interaction immediately
  await interaction.deferUpdate();

  const pos  = parseInt(interaction.customId.split("_")[1], 10);
  const tile = board[pos];

  if (player.reputation < tile.price) {
    await editTurnMessage(interaction, game, {
      content:
        `❌ <@${player.id}> can't afford **${tile.name}** ` +
        `(costs ${tile.price}, balance: ${player.reputation}). Skipping.`,
      components: [],
    });
    return advanceTurn(interaction, game);
  }

  player.reputation    -= tile.price;
  game.properties[pos]  = player.id;

  await editTurnMessage(interaction, game, {
    content:
      `🏠 <@${player.id}> bought **${tile.name}** for **${tile.price} rep**!\n` +
      `💼 Balance: ${player.reputation}`,
    components: [],
  });

  const bankrupt = isBankrupt(player) ? player : null;
  return advanceTurn(interaction, game, bankrupt);
}

export async function handleSkip(interaction) {
  const game   = getGame(interaction.guildId);
  const player = game?.players[game.currentTurn];

  if (!game) return interaction.update({ content: "❌ No active game.", components: [] });

  if (interaction.user.id !== player.id) {
    return interaction.reply({ content: "⏳ It's not your turn!", ephemeral: true });
  }

  await interaction.deferUpdate();

  await editTurnMessage(interaction, game, {
    content:    `⏭️ <@${player.id}> skipped the purchase.`,
    components: [],
  });

  return advanceTurn(interaction, game);
}