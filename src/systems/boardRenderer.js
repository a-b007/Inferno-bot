/**
 * boardRenderer.js
 *
 * Requires:  npm install @napi-rs/canvas
 *
 * FIX 1: renderBoard(game) now takes the full game object — never undefined players/properties.
 * FIX 2: Returns an AttachmentBuilder directly so callers don't need to wrap it.
 * FIX 3: Board image path looks for board_image.png AND board.png as fallback.
 * FIX 4: All error paths return null gracefully — never throws to the caller.
 */

import { createCanvas, loadImage } from '@napi-rs/canvas';
import { AttachmentBuilder }       from 'discord.js';
import { fileURLToPath }           from 'url';
import path                        from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try board_image.png first (root), then board.png
const BOARD_PATHS = [
  path.resolve(__dirname, '../../board_image.png'),
  path.resolve(__dirname, '../../board.png'),
];

// ── Board geometry ────────────────────────────────────────────────────────────
// Dynamically read from the loaded image — no hardcoded dimensions
let BOARD_W = 1028;
let BOARD_H = 1024;
const CORNER = 130;

function getRegW() { return (BOARD_W - 2 * CORNER) / 9; }
function getRegH() { return (BOARD_H - 2 * CORNER) / 9; }

// ── Cached board image — loaded once ─────────────────────────────────────────
let _boardImg  = null;
let _loadError = false;

async function getBoardImage() {
  if (_boardImg)  return _boardImg;
  if (_loadError) return null;

  for (const p of BOARD_PATHS) {
    try {
      _boardImg = await loadImage(p);
      BOARD_W   = _boardImg.width;
      BOARD_H   = _boardImg.height;
      console.log(`[boardRenderer] Loaded board image: ${p} (${BOARD_W}×${BOARD_H})`);
      return _boardImg;
    } catch { /* try next path */ }
  }

  _loadError = true;
  console.error('[boardRenderer] Could not find board image at any of:', BOARD_PATHS);
  return null;
}

// ── Tile centers (computed after image loads so dimensions are correct) ───────
function buildTileCenters() {
  const W   = BOARD_W;
  const H   = BOARD_H;
  const RW  = getRegW();
  const RH  = getRegH();
  const C   = CORNER;
  const c   = {};

  // Bottom row: 0 (GO, bottom-right) → 10 (Jail, bottom-left)
  c[0] = [W - C / 2, H - C / 2];
  for (let i = 1; i <= 9; i++)
    c[i] = [W - C - (i - 0.5) * RW, H - C / 2];
  c[10] = [C / 2, H - C / 2];

  // Left column: 11 (bottom) → 19 (top)
  for (let i = 11; i <= 19; i++)
    c[i] = [C / 2, H - C - (i - 11 + 0.5) * RH];

  // Top-left corner: Free Parking
  c[20] = [C / 2, C / 2];

  // Top row: 21 (left) → 29 (right)
  for (let i = 21; i <= 29; i++)
    c[i] = [C + (i - 21 + 0.5) * RW, C / 2];

  // Top-right corner: Go To Jail
  c[30] = [W - C / 2, C / 2];

  // Right column: 31 (top) → 39 (bottom)
  for (let i = 31; i <= 39; i++)
    c[i] = [W - C / 2, C + (i - 31 + 0.5) * RH];

  return c;
}

// Built lazily after first image load
let TILE_CENTERS = null;
function getTileCenters() {
  if (!TILE_CENTERS) TILE_CENTERS = buildTileCenters();
  return TILE_CENTERS;
}

// ── Ownership bar geometry ────────────────────────────────────────────────────
const BAR_THICK   = 10;
const BAR_COVER   = 0.80;
const CORNER_TILES = new Set([0, 10, 20, 30]);

function ownershipBarRect(tileIdx) {
  if (CORNER_TILES.has(tileIdx)) return null;
  const centers = getTileCenters();
  const pos = centers[tileIdx];
  if (!pos) return null;
  const [cx, cy] = pos;
  const RW = getRegW();
  const RH = getRegH();

  if (tileIdx >= 1  && tileIdx <= 9)  { const w = RW * BAR_COVER; return { x: cx - w/2, y: BOARD_H - BAR_THICK, w, h: BAR_THICK }; }
  if (tileIdx >= 11 && tileIdx <= 19) { const h = RH * BAR_COVER; return { x: 0,         y: cy - h/2,            w: BAR_THICK, h }; }
  if (tileIdx >= 21 && tileIdx <= 29) { const w = RW * BAR_COVER; return { x: cx - w/2,  y: 0,                   w, h: BAR_THICK }; }
  if (tileIdx >= 31 && tileIdx <= 39) { const h = RH * BAR_COVER; return { x: BOARD_W - BAR_THICK, y: cy - h/2,  w: BAR_THICK, h }; }
  return null;
}

// ── Player colours ────────────────────────────────────────────────────────────
export const PLAYER_COLOURS = ['#FF4444', '#44AAFF', '#44FF88', '#FFD700', '#FF44FF'];

// ── Token layout offsets (for up to 5 players on same tile) ──────────────────
const TOKEN_R = 13;
const OFFSETS = [
  [[0, 0]],
  [[-14, 0],  [14, 0]],
  [[-14, -10],[14, -10],[0, 10]],
  [[-14, -10],[14, -10],[-14, 10],[14, 10]],
  [[-14, -10],[14, -10],[-14, 10],[14, 10],[0, 0]],
];

// ── Core draw ─────────────────────────────────────────────────────────────────
function drawBoard(ctx, boardImg, players, properties) {
  const centers = getTileCenters();

  // 1. Base board
  ctx.drawImage(boardImg, 0, 0, BOARD_W, BOARD_H);

  // 2. Ownership colour bars on tile edges
  for (const [key, ownerId] of Object.entries(properties)) {
    const rect  = ownershipBarRect(parseInt(key, 10));
    if (!rect)  continue;
    const pIdx  = players.findIndex(p => p.id === ownerId);
    if (pIdx < 0) continue;
    ctx.fillStyle   = PLAYER_COLOURS[pIdx % PLAYER_COLOURS.length];
    ctx.globalAlpha = 0.9;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha = 1;
  }

  // 3. Group players by tile
  const byTile = new Map();
  players.forEach((p, idx) => {
    if (!byTile.has(p.position)) byTile.set(p.position, []);
    byTile.get(p.position).push(idx);
  });

  // 4. Draw tokens
  for (const [tileIdx, idxList] of byTile) {
    const center = centers[tileIdx];
    if (!center) continue;
    const [cx, cy] = center;
    const offsets  = OFFSETS[Math.min(idxList.length, 5) - 1] ?? OFFSETS[0];

    idxList.forEach((pIdx, slot) => {
      const [ox, oy] = offsets[slot] ?? [0, 0];
      const tx  = cx + ox;
      const ty  = cy + oy;
      const col = PLAYER_COLOURS[pIdx % PLAYER_COLOURS.length];

      // Shadow
      ctx.shadowColor   = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur    = 7;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Circle
      ctx.beginPath();
      ctx.arc(tx, ty, TOKEN_R, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      // White border
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur  = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = 'white';
      ctx.lineWidth   = 2.5;
      ctx.stroke();

      // Number label
      ctx.font         = `bold 12px Arial`;
      ctx.fillStyle    = 'white';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur   = 3;
      ctx.fillText(String(pIdx + 1), tx, ty);

      // Reset shadow
      ctx.shadowColor   = 'transparent';
      ctx.shadowBlur    = 0;
    });
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Render the board and return an AttachmentBuilder, or null on failure.
 *
 * @param {object} game  - full game state ({ players, properties })
 * @returns {Promise<AttachmentBuilder|null>}
 */
export async function renderBoard(game) {
  try {
    // Safely extract — never crash on undefined
    const players    = Array.isArray(game?.players)    ? game.players    : [];
    const properties = (game?.properties != null)      ? game.properties : {};

    const boardImg = await getBoardImage();
    if (!boardImg) return null;

    // Rebuild tile centers if dimensions changed (first call after load)
    TILE_CENTERS = buildTileCenters();

    const canvas = createCanvas(BOARD_W, BOARD_H);
    const ctx    = canvas.getContext('2d');

    drawBoard(ctx, boardImg, players, properties);

    const buf = await canvas.encode('png');
    return new AttachmentBuilder(buf, { name: 'board.png' });
  } catch (err) {
    console.error('[boardRenderer] render failed:', err.message);
    return null;
  }
}
