/**
 * Shown to a player who is in jail at the start of their turn.
 * They can pay 150 rep to get out, or attempt to roll doubles.
 */
export function getJailButtons(playerId) {
  return [
    {
      type: 1,
      components: [
        {
          type:      2,
          label:     '💸 Pay 150 to escape',
          style:     3,
          custom_id: `jail_pay_${playerId}`,
        },
        {
          type:      2,
          label:     '🎲 Roll for doubles',
          style:     1,
          custom_id: `jail_roll_${playerId}`,
        },
      ],
    },
  ];
}