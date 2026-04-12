export function handleProperty(game, player, tile, position) {
  const ownerId = game.properties[position];

  // 🟢 NOT OWNED → CAN BUY
  if (!ownerId) {
    if (player.reputation >= tile.price) {
      player.reputation -= tile.price;
      game.properties[position] = player.id;

      return `🏠 You bought **${tile.name}** for ${tile.price}`;
    } else {
      return `❌ Not enough reputation to buy ${tile.name}`;
    }
  }

  // 🔵 OWNED BY SELF
  if (ownerId === player.id) {
    return `🏠 You landed on your own property`;
  }

  // 🔴 OWNED BY SOMEONE ELSE → PAY RENT
  const owner = game.players.find(p => p.id === ownerId);

  player.reputation -= tile.rent;
  owner.reputation += tile.rent;

  return `💸 Paid ${tile.rent} to <@${owner.id}>`;
}