import { Client, GatewayIntentBits } from 'discord.js';
import { createServer }              from 'http';
import 'dotenv/config';
import { handleInteraction } from './discord/interactionHandler.js';

// ── Tiny HTTP server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});

// ── Debug: confirm token is present (never logs the actual token) ─────────────
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN is not set — check your environment variables on Render.');
  process.exit(1);
}
console.log(`🔑 Token loaded: ${token.slice(0, 10)}...`);

// ── Discord bot ───────────────────────────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  try {
    await handleInteraction(interaction);
  } catch (err) {
    console.error('[interactionCreate error]', err);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content:   '❌ Something went wrong. Please try again.',
          ephemeral: true,
        });
      }
    } catch { /* interaction may have already expired */ }
  }
});

client.login(token).catch(err => {
  console.error('❌ Failed to login to Discord:', err.message);
  process.exit(1);
});