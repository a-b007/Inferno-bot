import { Client, GatewayIntentBits } from 'discord.js';
import { createServer } from 'http';
import 'dotenv/config';
import { handleInteraction } from './discord/interactionHandler.js';

// ── HTTP server (REQUIRED for Render Web Service) ─────────────────────────────
const PORT = process.env.PORT || 3000;

createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});

// ── Token check ───────────────────────────────────────────────────────────────
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ DISCORD_TOKEN is not set — check environment variables.');
  process.exit(1);
}

console.log(`🔑 Token loaded: ${token.slice(0, 10)}...`);

// ── Discord client ────────────────────────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ── Events ────────────────────────────────────────────────────────────────────
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
          content: '❌ Something went wrong. Please try again.',
          ephemeral: true,
        });
      }
    } catch {
      // interaction might have expired
    }
  }
});

// ── Debug & stability logs ────────────────────────────────────────────────────
client.on('error', console.error);
client.on('warn', console.warn);
client.on('shardError', console.error);

// Optional: helps diagnose Render networking issues
client.on('debug', (msg) => {
  if (msg.includes('Connecting') || msg.includes('Ready')) {
    console.log('[DEBUG]', msg);
  }
});

// Optional heartbeat (keeps logs alive)
setInterval(() => {
  console.log('💓 Still alive');
}, 60000);

// ── Login with retry (IMPORTANT for Render) ───────────────────────────────────
const startBot = async () => {
  try {
    console.log('🔄 Attempting login...');
    await client.login(token);
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    console.log('⏳ Retrying in 10 seconds...');
    setTimeout(startBot, 10000);
  }
};

startBot();