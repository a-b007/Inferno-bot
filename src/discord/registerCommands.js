/**
 * registerCommands.js
 * -------------------
 * Registers slash commands with Discord.
 * Run once whenever you add / change commands:
 *   node src/registerCommands.js
 *
 * MODE: set REGISTER_MODE in your .env (or defaults to "guild")
 *   guild  → instant update, only visible in GUILD_ID server  ← use during dev
 *   global → takes up to 1 hour to propagate, visible everywhere ← use for prod
 *
 * To CLEAR all commands and fix duplicates:
 *   CLEAR=true node src/registerCommands.js
 */

import { REST, Routes } from 'discord.js';
import 'dotenv/config';

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID, REGISTER_MODE, CLEAR } = process.env;

if (!DISCORD_TOKEN) throw new Error("Missing DISCORD_TOKEN in .env");
if (!CLIENT_ID)     throw new Error("Missing CLIENT_ID in .env");

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

const commands = [
  {
    name:        'play',
    description: 'Create a new Inferno game and open the lobby.',
  },
  {
    name:        'status',
    description: 'View current player standings and board positions.',
  },
  {
    name:        'exit',
    description: 'End the current game immediately.',
  },
];

async function clearAll() {
  console.log('🧹 Clearing ALL commands (guild + global)...');

  // Clear global commands
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
  console.log('  ✅ Global commands cleared.');

  // Clear guild commands if GUILD_ID is set
  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
    console.log(`  ✅ Guild commands cleared (guild: ${GUILD_ID}).`);
  } else {
    console.log('  ⚠️  No GUILD_ID in .env — skipped guild clear.');
  }
}

async function register() {
  const mode = REGISTER_MODE ?? 'guild';

  if (mode === 'global') {
    console.log('🌐 Registering GLOBAL commands (may take up to 1 hour)...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Global commands registered.');
  } else {
    // Guild mode — instant, ideal for development
    if (!GUILD_ID) throw new Error("REGISTER_MODE=guild requires GUILD_ID in .env");
    console.log(`⚡ Registering GUILD commands (instant) for guild: ${GUILD_ID}...`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    console.log('✅ Guild commands registered.');
  }
}

(async () => {
  try {
    if (CLEAR === 'true') {
      await clearAll();
    } else {
      await register();
    }
  } catch (err) {
    console.error('❌ Registration failed:', err);
    process.exit(1);
  }
})();