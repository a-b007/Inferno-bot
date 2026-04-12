/** Roll two six-sided dice and return individual values + total. */
export function rollDice() {
  const d1 = Math.ceil(Math.random() * 6);
  const d2 = Math.ceil(Math.random() * 6);
  return { d1, d2, total: d1 + d2 };
}