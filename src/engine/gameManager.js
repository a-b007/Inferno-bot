import { games } from '../state/gameStore.js';

export const MAX_PLAYERS  = 5;
export const STARTING_REP = 1500;
export const GO_BONUS     = 50;
export const JAIL_BAIL    = 150;
export const SLOT_COST    = 50;    // cost to spin the slot machine on a slot tile
export const MAX_LAPS     = 4;     // game ends when any player completes this many laps

export function createGame(guildId) {
  games[guildId] = {
    players:     [],
    currentTurn: 0,
    properties:  {},
    started:     false,
  };
}

export function getGame(guildId)    { return games[guildId] ?? null; }
export function deleteGame(guildId) { delete games[guildId]; }

export function addPlayer(game, userId) {
  if (game.players.length >= MAX_PLAYERS)      return false;
  if (game.players.some(p => p.id === userId)) return false;
  game.players.push({
    id:         userId,
    position:   0,
    reputation: STARTING_REP,
    inJail:     false,
    laps:       0,           // how many times this player has passed/landed on GO
  });
  return true;
}

export function startGame(game) {
  game.started     = true;
  game.currentTurn = 0;
}

/**
 * Move a player by `steps` tiles.
 * Increments player.laps on each GO pass/landing.
 * Returns { passedGO, lapCompleted, currentLap }.
 */
export function movePlayer(player, steps, boardLength) {
  const newPos    = player.position + steps;
  const passedGO  = newPos >= boardLength;
  player.position = newPos % boardLength;

  if (passedGO) {
    player.reputation += GO_BONUS;
    player.laps       += 1;
  }

  return { passedGO, lap: player.laps };
}

/**
 * Calculate the total asset value of a player:
 * cash + sum of prices of all properties they own.
 */
export function totalAssets(player, properties, boardTiles) {
  const propValue = Object.entries(properties)
    .filter(([, ownerId]) => ownerId === player.id)
    .reduce((sum, [tileIdx]) => {
      const tile = boardTiles[parseInt(tileIdx, 10)];
      return sum + (tile?.price ?? 0);
    }, 0);
  return player.reputation + propValue;
}

export function teleportToJail(player, jailIndex) {
  player.position = jailIndex;
  player.inJail   = true;
}

export function releaseFromJail(player) {
  player.inJail = false;
}

export function isBankrupt(player) { return player.reputation <= 0; }

export function getRichestPlayer(game) {
  return game.players.reduce((best, p) =>
    p.reputation > best.reputation ? p : best
  );
}