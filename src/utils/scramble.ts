// ============================================================
// Alugard Puzzle — Piece Scramble Utility
// Produces a randomized layout for puzzle pieces in the tray.
// ============================================================

import type { PuzzlePiece, LevelConfig, OctagonCell } from '../types/puzzle';

/**
 * Given the original cells, create all puzzle pieces in their
 * "home" (unscrambled) positions, then scatter them into the tray area.
 *
 * @param cells        - ordered array of OctagonCell from buildGrid()
 * @param levelConfig  - current level settings
 * @param trayRect     - bounding box of the tray DOM element (board-relative coords)
 * @param pieceSize    - W = s + 2d, the bounding box size of each piece
 */
export function createAndScramblePieces(
  cells: OctagonCell[],
  levelConfig: LevelConfig,
  trayRect: { width: number; height: number },
  pieceSize: number,
): PuzzlePiece[] {
  // 1. Create pieces in order (home positions)
  let pieces: PuzzlePiece[] = cells.map((cell) => ({
    id: cell.id,
    currentCellId: null,
    x: 0,
    y: 0,
    isPlaced: false,
    correctNeighborCount: 0,
  }));

  // 2. Fisher-Yates shuffle
  pieces = fisherYates(pieces);

  // 3. Assign tray positions — simple grid layout with the scramble scatter on top
  const scatter = levelConfig.scatterPx;
  const cols = Math.max(1, Math.floor(trayRect.width / (pieceSize + 8)));
  const padding = 8;

  pieces = pieces.map((piece, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Base grid position in tray
    let x = col * (pieceSize + padding);
    let y = row * (pieceSize + padding);

    // Add randomness based on level
    if (scatter > 0) {
      x += randBetween(-scatter * 0.3, scatter * 0.3);
      y += randBetween(-scatter * 0.1, scatter * 0.1);
    }

    // Clamp within tray bounds
    x = Math.max(0, Math.min(x, trayRect.width - pieceSize));
    y = Math.max(0, Math.min(y, trayRect.height * 1.5));

    return { ...piece, x, y };
  });

  return pieces;
}

/** Fisher-Yates in-place shuffle — O(n) */
function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
