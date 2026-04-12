/**
 * Global in-memory store.
 * Shape: { [guildId]: GameState }
 *
 * GameState = {
 *   players:     Player[],
 *   currentTurn: number,
 *   properties:  { [boardIndex]: playerId },
 *   started:     boolean,
 * }
 *
 * Player = {
 *   id:         string,   // Discord user ID
 *   position:   number,   // board index
 *   reputation: number,   // currency
 *   inJail:     boolean,
 * }
 */
export const games = {};