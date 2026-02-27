// ============================================================
// Alugard Puzzle — Octagon Tessellation Engine
//
// Math: 4.8.8 semi-regular tessellation.
//   s  = side length of each octagon (all sides equal)
//   d  = s * √2 / 2  (length of the corner diagonal cut)
//   W  = s + 2d       (full bounding-box width = height of one octagon)
//   step = s + d      (repeating tile step in both axes)
//
// Octagon 8 vertices relative to top-left (0, 0):
//   (d, 0) → (d+s, 0) → (W, d) → (W, d+s)
//   → (d+s, W) → (d, W) → (0, d+s) → (0, d)
//
// Neighbour mapping (cardinal + diagonal, all octagons):
//   N=(col,row-1), S=(col,row+1), E=(col+1,row), W=(col-1,row)
//   NE=(col+1,row-1), NW=(col-1,row-1),
//   SE=(col+1,row+1), SW=(col-1,row+1)
// ============================================================

import type { OctagonCell, NeighborMap } from '../types/puzzle';

// ----------------------------------------------------------
// Compute the optimal side-length s so the grid fills the canvas
// ----------------------------------------------------------
export function computeSideLength(
  canvasW: number,
  canvasH: number,
  cols: number,
  rows: number,
): number {
  const SQRT2_HALF = Math.SQRT2 / 2; // ≈ 0.7071
  
  const maxStepW = canvasW / (cols + SQRT2_HALF);
  const maxStepH = canvasH / (rows + SQRT2_HALF);
  
  // Multiply by 0.92 to give a nice 8% margin so the board isn't perfectly flush
  const step = Math.min(maxStepW, maxStepH) * 0.92;
  
  // step = s * (1 + √2/2) => s = step / (1 + √2/2)
  const s = step / (1 + SQRT2_HALF);
  return Math.floor(s);
}

// ----------------------------------------------------------
// Main grid builder
// ----------------------------------------------------------
export function buildGrid(
  cols: number,
  rows: number,
  s: number,
  boardW: number,
  boardH: number,
): OctagonCell[] {
  const d = (s * Math.SQRT2) / 2;
  const W = s + 2 * d;       // bounding box size
  const step = s + d;        // grid step

  // Centre the grid inside the board
  const totalW = cols * step + d;
  const totalH = rows * step + d;
  const offsetX = Math.max(0, (boardW - totalW) / 2);
  const offsetY = Math.max(0, (boardH - totalH) / 2);

  const cells: OctagonCell[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const originX = offsetX + col * step;
      const originY = offsetY + row * step;
      const centerX = originX + W / 2;
      const centerY = originY + W / 2;

      // CSS clip-path polygon (8 points, absolute px values inside the div)
      const clipPath = buildClipPath(d, s, W);

      // Background image offset: position this piece's slice of the image.
      // The piece div is W×W; background is the full image scaled to board size.
      // Using negative background-position to shift the image so only the correct
      // part shows through the clip-path window.
      const bgOffsetX = originX;
      const bgOffsetY = originY;

      const id = cellId(col, row);

      cells.push({
        id,
        col,
        row,
        originX,
        originY,
        centerX,
        centerY,
        clipPath,
        bgOffsetX,
        bgOffsetY,
        neighbors: buildNeighborMap(col, row, cols, rows),
      });
    }
  }

  return cells;
}

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

export function cellId(col: number, row: number): string {
  return `oct_${col}_${row}`;
}

function buildClipPath(d: number, s: number, W: number): string {
  // All values are raw px numbers; the div will be exactly W×W
  const pts = [
    [d,     0    ],
    [d + s, 0    ],
    [W,     d    ],
    [W,     d + s],
    [d + s, W    ],
    [d,     W    ],
    [0,     d + s],
    [0,     d    ],
  ];
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(', ')})`;
}

function buildNeighborMap(
  col: number,
  row: number,
  cols: number,
  rows: number,
): NeighborMap {
  const map: NeighborMap = {};
  if (row > 0)         map.N  = cellId(col,     row - 1);
  if (row < rows - 1)  map.S  = cellId(col,     row + 1);
  if (col < cols - 1)  map.E  = cellId(col + 1, row    );
  if (col > 0)         map.W  = cellId(col - 1, row    );
  if (col < cols - 1 && row > 0)         map.NE = cellId(col + 1, row - 1);
  if (col > 0         && row > 0)         map.NW = cellId(col - 1, row - 1);
  if (col < cols - 1 && row < rows - 1)  map.SE = cellId(col + 1, row + 1);
  if (col > 0         && row < rows - 1) map.SW = cellId(col - 1, row + 1);
  return map;
}

// ----------------------------------------------------------
// Neighbor status — returns true for each neighbour of pieceId
// where that neighbour is ALSO placed in ITS correct cell.
// (two pieces are "correctly neighbouring" when each is in its own home cell)
// ----------------------------------------------------------
export interface NeighborStatus {
  /** cellId of neighbour → whether it's correctly placed */
  [neighborCellId: string]: boolean;
}

export function computeNeighborStatus(
  cell: OctagonCell,
  occupancyMap: Record<string, string | null>,
): NeighborStatus {
  const result: NeighborStatus = {};
  for (const neighborCellId of Object.values(cell.neighbors)) {
    if (!neighborCellId) continue;
    const occupant = occupancyMap[neighborCellId] ?? null;
    // The "correct" piece for a cell has the same id as the cell
    result[neighborCellId] = occupant === neighborCellId;
  }
  return result;
}

// ----------------------------------------------------------
// Given a point (px, py) in board coordinates, find the cell it falls into.
// Useful for quick hit-testing drop targets without relying on DOM alone.
// ----------------------------------------------------------
export function findCellAtPoint(
  px: number,
  py: number,
  cells: OctagonCell[],
  s: number,
): OctagonCell | null {
  const d = (s * Math.SQRT2) / 2;
  const W = s + 2 * d;
  for (const cell of cells) {
    // Quick bounding-box check first
    if (
      px < cell.originX || px > cell.originX + W ||
      py < cell.originY || py > cell.originY + W
    ) continue;
    // Point-in-polygon for octagon (convex, so simple)
    if (isPointInOctagon(px - cell.originX, py - cell.originY, d, W)) {
      return cell;
    }
  }
  return null;
}

/** Quick convex polygon point-in-test for a regular octagon */
function isPointInOctagon(lx: number, ly: number, d: number, W: number): boolean {
  // An octagon is convex; test using the perpendicular distance to each edge group.
  // Axis-aligned edges:
  if (lx < 0 || lx > W || ly < 0 || ly > W) return false;
  // Diagonal edges (cutting corners):
  // Top-left cut: x + y >= d
  if (lx + ly < d) return false;
  // Top-right cut: (W-x) + y >= d
  if ((W - lx) + ly < d) return false;
  // Bottom-left cut: x + (W-y) >= d
  if (lx + (W - ly) < d) return false;
  // Bottom-right cut: (W-x) + (W-y) >= d
  if ((W - lx) + (W - ly) < d) return false;
  return true;
}
