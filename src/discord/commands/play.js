import { createGame, getGame, addPlayer, MAX_PLAYERS } from '../../engine/gameManager.js';
import { getLobbyButtons }                             from '../components/lobbyButtons.js';

export async function handlePlay(interaction) {
  const { guildId, user } = interaction;

  if (getGame(guildId)) {
    return interaction.reply({
      content:   '⚠️ A game is already running. Use `/exit` to end it first.',
      ephemeral: true,
    });
  }

  createGame(guildId);
  const game = getGame(guildId);
  addPlayer(game, user.id);
  game.hostId = user.id;

  // Reply immediately to acknowledge the interaction (required within 3s)
  // then send a separate channel message so we have a real Message object
  await interaction.reply({ content: '🎰 Creating lobby…', ephemeral: true });

  const msg = await interaction.channel.send({
    content:    buildLobbyContent(game),
    components: getLobbyButtons(),
  });

  game.lobbyMessage = msg;
}

export function buildLobbyContent(game) {
  const playerList = game.players.map(p => `<@${p.id}>`).join(', ');
  return (
    `🎰 **Inferno** — Lobby\n` +
    `👥 Players (${game.players.length}/${MAX_PLAYERS}): ${playerList}\n\n` +
    `Press **Join Game** to enter, or **Start Game** (host only) when everyone is ready.`
  );
}