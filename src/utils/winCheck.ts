// ============================================================
// Alugard Puzzle — Win & Completion Check Utilities
// ============================================================

import type { GameState, OctagonCell } from '../types/puzzle';

/**
 * Returns true when ALL pieces are in their correct home cell.
 */
export function checkWin(state: GameState): boolean {
  for (const piece of Object.values(state.pieces)) {
    if (!piece.isPlaced || piece.currentCellId !== piece.id) return false;
  }
  return true;
}

/**
 * Returns 0–1 representing what fraction of pieces are home.
 */
export function computeCompletion(state: GameState): number {
  const total = Object.keys(state.pieces).length;
  if (total === 0) return 0;
  let correct = 0;
  for (const piece of Object.values(state.pieces)) {
    if (piece.isPlaced && piece.currentCellId === piece.id) correct++;
  }
  return correct / total;
}

/**
 * For a given piece, count how many of its neighbours
 * are also correctly placed in THEIR home cells.
 */
export function computePieceNeighborScore(
  pieceId: string,
  occupancyMap: Record<string, string | null>,
  gridMap: Map<string, OctagonCell>,
): number {
  const cell = gridMap.get(pieceId);
  if (!cell) return 0;
  let count = 0;
  for (const neighborCellId of Object.values(cell.neighbors)) {
    if (!neighborCellId) continue;
    if (occupancyMap[neighborCellId] === neighborCellId) count++;
  }
  return count;
}
