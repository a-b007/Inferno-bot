/**
 * Returns an action-row array with Buy and Skip buttons for a property tile.
 * custom_id encodes the board position so handlers know which tile is in play.
 */
export function getPropertyButtons(position) {
  return [
    {
      type: 1,
      components: [
        {
          type:      2,
          label:     "🏠 Buy",
          style:     3,            // green
          custom_id: `buy_${position}`,
        },
        {
          type:      2,
          label:     "⏭️ Skip",
          style:     2,            // grey
          custom_id: `skip_${position}`,
        },
      ],
    },
  ];
}