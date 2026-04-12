import { TILE_TYPES } from '../types/Tile.js';

export const board = [
  // 🔻 Bottom row (right → left)
  { type: TILE_TYPES.START,      name: "GO" },
  { type: TILE_TYPES.PROPERTY,   name: "Mandalay Bay",      price: 60,  rent: 10 },
  { type: TILE_TYPES.SLOT,       name: "Slot Machine" },
  { type: TILE_TYPES.PROPERTY,   name: "Luxor",             price: 100, rent: 12 },
  { type: TILE_TYPES.EVENT,      name: "Event" },
  { type: TILE_TYPES.PROPERTY,   name: "Excalibur Hotel",   price: 120, rent: 14 },
  { type: TILE_TYPES.PROPERTY,   name: "New York-New York", price: 140, rent: 16 },
  { type: TILE_TYPES.SLOT,       name: "Slot Machine" },
  { type: TILE_TYPES.PROPERTY,   name: "Park MGM",          price: 160, rent: 18 },
  { type: TILE_TYPES.PROPERTY,   name: "The Cosmopolitan",  price: 180, rent: 20 },
  { type: TILE_TYPES.JAIL,       name: "Jail" },

  // 🔺 Left column (bottom → top)
  { type: TILE_TYPES.PROPERTY,   name: "Bellagio",          price: 200, rent: 22 },
  { type: TILE_TYPES.EVENT,      name: "Event" },
  { type: TILE_TYPES.PROPERTY,   name: "Caesars Palace",    price: 220, rent: 24 },
  { type: TILE_TYPES.PROPERTY,   name: "The Mirage",        price: 240, rent: 26 },
  { type: TILE_TYPES.SLOT,       name: "Slot Machine" },
  { type: TILE_TYPES.PROPERTY,   name: "Treasure Island",   price: 260, rent: 28 },
  { type: TILE_TYPES.PROPERTY,   name: "The Venetian",      price: 280, rent: 30 },
  { type: TILE_TYPES.EVENT,      name: "Event" },
  { type: TILE_TYPES.PROPERTY,   name: "Wynn",              price: 300, rent: 32 },
  { type: TILE_TYPES.FREE_PARKING,   name: "Free Parking"},
  // 🔺 Top row (left → right)
  { type: TILE_TYPES.PROPERTY,   name: "Encore",            price: 320, rent: 34 },
  { type: TILE_TYPES.PROPERTY,   name: "Circus Circus",     price: 340, rent: 36 },
  { type: TILE_TYPES.EVENT,      name: "Event" },
  { type: TILE_TYPES.PROPERTY,   name: "Stratosphere",      price: 360, rent: 38 },
  { type: TILE_TYPES.SLOT,       name: "Slot Machine" },
  { type: TILE_TYPES.PROPERTY,   name: "Fremont Street",    price: 380, rent: 40 },
  { type: TILE_TYPES.PROPERTY,   name: "Golden Nugget",     price: 400, rent: 42 },
  { type: TILE_TYPES.PROPERTY,   name: "Vegas Chapel",     price: 300, rent: 32 },
  { type: TILE_TYPES.PROPERTY,   name: "Fenchurch St. Station",     price: 390, rent: 40 },
  { type: TILE_TYPES.GO_TO_JAIL, name: "Go To Jail" },,

  // 🔻 Right column (top → bottom)
  { type: TILE_TYPES.EVENT,      name: "Event" },
  { type: TILE_TYPES.PROPERTY,   name: "Red Rock Canyon",   price: 420, rent: 44 },
  { type: TILE_TYPES.PROPERTY,   name: "Hoover Dam",        price: 440, rent: 46 },
  { type: TILE_TYPES.SLOT,       name: "Slot Machine" },
  { type: TILE_TYPES.PROPERTY,   name: "Las Vegas Sign",    price: 460, rent: 48 },
  { type: TILE_TYPES.PROPERTY,   name: "MGM Grand",         price: 480, rent: 50 },
  { type: TILE_TYPES.PROPERTY,   name: "The Hilton",        price: 440, rent: 49 },
  { type: TILE_TYPES.EVENT,      name: "Event" },
  { type: TILE_TYPES.PROPERTY,   name: "Hotel Excalibur",   price: 500, rent:50}
];

/** Index of the Jail tile — used for Go To Jail teleport */
export const JAIL_POSITION = board.findIndex(t => t.type === "jail");