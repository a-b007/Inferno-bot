import { SLOT_COST } from '../../engine/gameManager.js';

/**
 * Shown when a player lands on a Slot Machine tile.
 * They must pay SLOT_COST to spin, or skip.
 */
export function getSlotButtons(playerId) {
  return [
    {
      type: 1,
      components: [
        {
          type:      2,
          label:     `🎰 Spin (${SLOT_COST} rep)`,
          style:     3,
          custom_id: `slot_spin_${playerId}`,
        },
        {
          type:      2,
          label:     '⏭️ Skip',
          style:     2,
          custom_id: `slot_skip_${playerId}`,
        },
      ],
    },
  ];
}