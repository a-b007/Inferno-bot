import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { handleInteraction } from './discord/interactionHandler.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  try {
    await handleInteraction(interaction);
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.DISCORD_TOKEN);