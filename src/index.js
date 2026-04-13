import { Client, GatewayIntentBits } from 'discord.js';
import { createServer }              from 'http';
import 'dotenv/config';
import { handleInteraction } from './discord/interactionHandler.js';

// ── Tiny HTTP server — required by Render Web Service to stay alive ───────────
// Render pings this every few minutes. Without it Render thinks the app crashed.
const PORT = process.env.PORT || 3000;
createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});

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

client.login(process.env.DISCORD_TOKEN);