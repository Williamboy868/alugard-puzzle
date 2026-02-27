// ============================================================
// Alugard Puzzle — Canvas Renderer
// Handles:
//  1. Ghost grid  — faint octagon outlines showing target positions
//  2. Border pass — green/red edges between adjacent placed pieces
// ============================================================

import type { OctagonCell } from '../types/puzzle';

// -- Ghost grid colours & style --
const GHOST_STROKE     = 'rgba(255,255,255,0.12)';
const GHOST_FILL       = 'rgba(255,255,255,0.02)';
const GHOST_LINE_WIDTH = 1.2;

// -- Border colours --
const CORRECT_COLOR  = '#00FF88';  // green
const WRONG_COLOR    = '#FF4444';  // red
const BORDER_WIDTH   = 3;
const BORDER_ALPHA   = 0.9;

// ============================================================
// Ghost grid
// ============================================================

export function drawGhostGrid(
  ctx: CanvasRenderingContext2D,
  cells: OctagonCell[],
  s: number,
): void {
  const d = (s * Math.SQRT2) / 2;
  const W = s + 2 * d;

  ctx.save();
  ctx.strokeStyle = GHOST_STROKE;
  ctx.fillStyle   = GHOST_FILL;
  ctx.lineWidth   = GHOST_LINE_WIDTH;
  ctx.setLineDash([4, 4]);

  for (const cell of cells) {
    drawOctagonPath(ctx, cell.originX, cell.originY, d, s, W);
    ctx.fill();
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.restore();
}

// ============================================================
// Border pass (called every animation frame during solving)
// ============================================================

export function drawBorders(
  ctx: CanvasRenderingContext2D,
  cells: OctagonCell[],
  occupancyMap: Record<string, string | null>,
  s: number,
): void {
  const d = (s * Math.SQRT2) / 2;
  const W = s + 2 * d;

  ctx.save();
  ctx.lineWidth   = BORDER_WIDTH;
  ctx.globalAlpha = BORDER_ALPHA;
  ctx.setLineDash([]);

  for (const cell of cells) {
    const occupantId = occupancyMap[cell.id] ?? null;
    if (!occupantId) continue; // empty cell — skip

    // Draw octagon border with colour based on neighbour correctness
    // We use a per-PIECE approach: if this piece is in its home → full green outline;
    // otherwise, draw each shared edge based on whether the neighbour is correct.
    const isHome = occupantId === cell.id;

    if (isHome) {
      // Full green border — piece is home
      ctx.strokeStyle = CORRECT_COLOR;
      drawOctagonPath(ctx, cell.originX, cell.originY, d, s, W);
      ctx.stroke();
    } else {
      // Red border — piece is in wrong cell
      ctx.strokeStyle = WRONG_COLOR;
      drawOctagonPath(ctx, cell.originX, cell.originY, d, s, W);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ============================================================
// Helpers
// ============================================================

function drawOctagonPath(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  d: number,
  s: number,
  W: number,
): void {
  ctx.beginPath();
  ctx.moveTo(ox + d,     oy);
  ctx.lineTo(ox + d + s, oy);
  ctx.lineTo(ox + W,     oy + d);
  ctx.lineTo(ox + W,     oy + d + s);
  ctx.lineTo(ox + d + s, oy + W);
  ctx.lineTo(ox + d,     oy + W);
  ctx.lineTo(ox,         oy + d + s);
  ctx.lineTo(ox,         oy + d);
  ctx.closePath();
}
