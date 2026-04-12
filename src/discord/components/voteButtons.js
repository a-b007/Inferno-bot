/**
 * Returns an action-row with Support / Oppose / Skip vote buttons.
 * custom_id encodes the active player's ID so the handler can
 * validate the vote belongs to the right event.
 */
export function getVoteButtons(activePlayerId) {
  return [
    {
      type: 1,
      components: [
        {
          type:      2,
          label:     "🤝 Support",
          style:     3,                            // green
          custom_id: `vote_support_${activePlayerId}`,
        },
        {
          type:      2,
          label:     "🗡️ Oppose",
          style:     4,                            // red
          custom_id: `vote_oppose_${activePlayerId}`,
        },
        {
          type:      2,
          label:     "🚫 Skip",
          style:     2,                            // grey
          custom_id: `vote_skip_${activePlayerId}`,
        },
      ],
    },
  ];
}
