/**
 * Returns an action-row array with a single Roll Dice button.
 * custom_id encodes the player ID so we can verify turn ownership.
 */
export function getRollButton(playerId) {
  return [
    {
      type: 1,
      components: [
        {
          type:      2,
          label:     "🎲 Roll Dice",
          style:     1,
          custom_id: `roll_${playerId}`,
        },
      ],
    },
  ];
}