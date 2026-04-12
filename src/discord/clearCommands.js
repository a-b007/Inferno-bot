/**
 * clearCommands.js
 * ----------------
 * Run this ONCE to wipe every slash command (global + all guilds the bot is in).
 * After this, run registerCommands.js to re-register cleanly.
 *
 *   node src/clearCommands.js
 */

import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN) throw new Error("Missing DISCORD_TOKEN in .env");
if (!CLIENT_ID)     throw new Error("Missing CLIENT_ID in .env");

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    // 1. Wipe global commands
    console.log('🧹 Wiping global commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    console.log('  ✅ Global commands cleared.');

    // 2. Wipe commands in every guild the bot is currently in
    console.log('🔍 Fetching guilds bot is in...');
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    await client.login(DISCORD_TOKEN);

    // Wait for the client to be ready
    await new Promise(resolve => client.once('ready', resolve));

    const guilds = [...client.guilds.cache.values()];
    console.log(`  Found ${guilds.length} guild(s).`);

    for (const guild of guilds) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, guild.id),
        { body: [] },
      );
      console.log(`  ✅ Cleared commands in guild: ${guild.name} (${guild.id})`);
    }

    await client.destroy();
    console.log('\n✅ All commands wiped. Now run: node src/registerCommands.js');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();