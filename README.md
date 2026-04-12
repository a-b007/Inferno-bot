
#   Inferno

**Team Name:** Triad

**Project Title:** Inferno 

**Authors:**
- 1.)Anamitra Basu(Roll no. BC2025008)  
- 2.)Aaronya Chakraborty(Roll no. IC2025003)
- 3.)Shreyansh Sinha(Roll no. BC2025091)


## Short Description

[Inferno](https://en.wikipedia.org/wiki/Divine_Comedy#Inferno) (as its name suggests) is a Monopoly based interactive multiplayer game discord bot completely based on the theme Sin City [Las Vegas]. As soon as you step into the game you enter the Sin City of Vegas. Here you can visit all the famous attractions purchase them, collect rent, gamble, land yourself in great trouble(smuggling drugs) or in great luck( winning a jackpot). At the end, the player with the most balance + property value is crowned as the conquerer of Sin City.

##  Slash Commands
 
| Command | Description |
|---|---|
| `/play` | Create a new game and open the lobby. The host can then invite others to join. |
| `/status` | Show current player balances, board positions, lap counts, and properties owned. |
| `/exit` | Force-end the current game and display the final SIN-O-METER standings. |
 
---
 
##  How to Play
 
1. One player types `/play` — a lobby message appears with **Join Game** and **Start Game** buttons
2. Other players (up to 5 total) click **Join Game**
3. The host clicks **Start Game** (minimum 2 players required)
4. Players take turns clicking ** Roll Dice**
5. The bot moves the player's token and resolves the tile they land on
6. The game ends when any player completes **4 laps**, or a player goes bankrupt
7. The leaderboard is displayed — richest player at the top, poorest at the bottom
 
---
 
##  Game Rules
 
###  Starting Balance
Each player starts with **$1,500**.
 
###  GO
- Passing GO awards **+$50**
- Landing directly on GO also awards **+$50**
 
###  Properties
- Landing on an unowned property shows **Buy** and **Skip** buttons
- Buying a property marks that tile with your player colour on the board
- Landing on a property owned by another player deducts rent from your balance and pays it to the owner
 
###  Slot Machine
- Landing on a Slot Machine shows **Spin ($50)** and **Skip** buttons
- Spinning costs $50 upfront, then awards or deducts a random amount based on weighted tiers:
 
| Tier | Probability | Outcome |
|---|---|---|
|  JACKPOT | 5% | +$300 |
|  BIG WIN | 10% | +$150 |
|  WIN | 20% | +$75 |
|  PUSH | 25% | ±$0 |
|  LOSS | 20% | −$75 |
|  BIG LOSS | 14% | −$150 |
|  RUINOUS | 6% | Lose entire balance |
 
###  Event Cards
- The active player draws a hidden card (gain or loss)
- All other players have **10 seconds** to vote: **Support**, **Oppose**, or **Skip**
- Supporters and opposers win or lose a side-bet (20% of the card's value)
- The card is revealed after voting closes
 
###  Jail
- **Go To Jail** tile teleports you to Jail immediately
- **Landing on Jail** (visiting) — you are not locked in
- If you are in Jail on your turn, you can:
  - Pay **$150 bail** to escape and roll normally
  - Roll dice — if you get doubles you escape for free and move that many spaces
 
###  Free Parking
Nothing happens — enjoy the rest.
 
###  End Game
- The game ends the moment any player completes their **4th lap**
- The final **SIN-O-METER** shows: Cash + Property Value = Total Wealth
- Ranking is **ascending** — most broke (most sinful) at the top, richest at the bottom
 
---

## Libraries Used
 
| Library | Version | Purpose |
|---|---|---|
| [discord.js](https://discord.js.org) | ^14.26.2 | Discord API client — slash commands, buttons, message handling |
| [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) | ^0.1.97 | High-performance canvas rendering — draws player tokens and property bars onto the board image every turn |
| [dotenv](https://github.com/motdotla/dotenv) | ^17.4.1 | Loads environment variables from `.env` into `process.env` |
| [gif-encoder-2](https://github.com/benjaminadk/gif-encoder-2) | ^1.0.5 | GIF encoding (available for future animated board features) |
 
All listed in `package.json` and installed via `npm install`.
 
---
 
##  Project Structure
 
```
discord-monopoly/
├── board_image.png              # The Inferno board image (1028×1024)
├── package.json
├── .env                         # Your private tokens (never commit this)
│
└── src/
    ├── index.js                 # Entry point — starts the Discord client
    │
    ├── config/
    │   └── constants.js         # Game-wide constants (starting balance, GO bonus, lap limit, etc.)
    │
    ├── types/
    │   ├── Tile.js              # TILE_TYPES enum (PROPERTY, SLOT, EVENT, JAIL, etc.)
    │   ├── Player.js            # Player type reference
    │   └── Game.js              # Game type reference
    │
    ├── state/
    │   └── gameStore.js         # Global in-memory store — { [guildId]: GameState }
    │
    ├── engine/
    │   ├── board.js             # 40-tile board definition with names, prices, and rent values
    │   ├── dice.js              # rollDice() — returns d1, d2, total
    │   ├── gameManager.js       # Core game logic: create/get/delete game, move player, manage laps, bankruptcy
    │   ├── turnManager.js       # advanceTurn() — posts next turn message with fresh board image
    │   ├── jail.js              # Jail utility functions
    │   └── player.js            # Player utility functions
    │
    ├── systems/
    │   ├── boardRenderer.js     # Renders player tokens + property colour bars onto board_image.png
    │   ├── eventSystem.js       # 17 event cards with descriptions, deltas, and spectator vote logic
    │   ├── slotSystem.js        # Weighted slot machine spin logic (7 tiers including RUINOUS)
    │   ├── leaderboard.js       # buildLeaderboard() — SIN-O-METER end-game standings
    │   └── propertySystem.js    # Property ownership helpers
    │
    └── discord/
        ├── interactionHandler.js  # Routes all slash commands and button presses to the right handler
        ├── registerCommands.js    # Run once to register /play /status /exit with Discord
        ├── clearCommands.js       # Utility to wipe all registered commands
        │
        ├── commands/
        │   ├── play.js            # /play — creates game, opens lobby
        │   ├── lobby.js           # Join and Start Game button handlers
        │   ├── start.js           # /start fallback command handler
        │   ├── roll.js            #  Roll Dice + Jail roll/pay + Slot spin/skip handlers
        │   ├── propertyActions.js # Buy and Skip property button handlers
        │   ├── eventHandler.js    # Event card draw, voting countdown, result application
        │   ├── status.js          # /status — shows balances, positions, lap counts
        │   ├── exit.js            # /exit — force-ends game and shows leaderboard
        │   ├── join.js            # Alternate join handler
        │   └── skip.js            # Alternate skip handler
        │
        └── components/
            ├── turnButtons.js     #  Roll Dice button
            ├── lobbyButtons.js    # Join Game + Start Game buttons
            ├── propertyButtons.js #  Buy +  Skip buttons
            ├── slotButtons.js     #  Spin +  Skip buttons
            ├── jailButtons.js     # Pay Bail +  Roll for Doubles buttons
            ├── voteButtons.js     #  Support +  Oppose + Skip vote buttons
            └── eventButtons.js    # Event card interaction buttons
```
 
---


---
##  Installation
 
### Prerequisites
 
| Requirement | Minimum Version |
|---|---|
| [Node.js](https://nodejs.org) | v18.0.0 |
| npm | Included with Node.js |
| A Discord account | — |
 
---
 Clone the GitHub reposistory in a project folder.
### Step 1 — Create a Discord Bot Application
 
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → give it a name (e.g. `Inferno`) → click **Create**
3. In the left sidebar click **Bot**
4. Click **Reset Token** → confirm → **copy the token** and save it somewhere safe
5. On the same page scroll down and enable all three **Privileged Gateway Intents**:
   -  Presence Intent
   -  Server Members Intent
   -  Message Content Intent
6. Click **Save Changes**
 
---
 
### Step 2 — Invite the Bot to Your Server
 
1. In the left sidebar go to **OAuth2 → URL Generator**
2. Under **Scopes** check: `bot` and `applications.commands`
3. Under **Bot Permissions** check:
   -  Send Messages
   -  Attach Files
   -  Read Message History
   -  Use Slash Commands
   -  Embed Links
4. Copy the generated URL at the bottom → paste it in your browser
5. Select your server → click **Authorise**
 
---
 
### Step 3 — Get Your IDs
 
Enable Developer Mode in Discord first: **Settings → Advanced → Developer Mode → ON**
 
| ID | How to get it |
|---|---|
| **Client ID** | Developer Portal → your application → **General Information** → copy **Application ID** |
| **Guild ID** | Right-click your server icon in Discord → **Copy Server ID** |
 
---
 
### Step 4 — Set Up the Environment File
 
In the **root of the project folder**, create a file named `.env` and add:
 
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_server_id_here
```
 
 
---
 
### Step 5 — Install Dependencies
 
```bash
npm install
npm install canvas
npm install @napi-rs/canvas gif-encoder-2

```
 
---
 
### Step 6 — Register Slash Commands
 
Run this **once** to register the bot's commands with Discord. Re-run it any time you add or rename a command.
 
```bash
node src/discord/registerCommands.js
```
 
Expected output:
```
 Registering GUILD commands (instant) for guild: 123456789...
 Guild commands registered.
```
 
> **To clear all commands** (fixes duplicate command issues):
> ```bash
> CLEAR=true node src/discord/registerCommands.js
> ```
 
---
 
##  Running the Bot
 
```bash
npm start
```
 
Expected output:
```
Logged in as Inferno#1234
[boardRenderer] Loaded board image: /path/to/board_image.png (1028×1024)
```
 
To stop the bot press `Ctrl + C`.
 
---
 
