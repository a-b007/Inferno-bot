/**
 * Returns an action-row array with Join and Start buttons for the lobby message.
 * The Start button is always visible but only the host should be able to use it
 * (enforced in the handler, not here).
 */
export function getLobbyButtons() {
  return [
    {
      type: 1,
      components: [
        {
          type:      2,
          label:     "✋ Join Game",
          style:     1,           // blurple
          custom_id: "lobby_join",
        },
        {
          type:      2,
          label:     "🎮 Start Game",
          style:     3,           // green
          custom_id: "lobby_start",
        },
      ],
    },
  ];
}