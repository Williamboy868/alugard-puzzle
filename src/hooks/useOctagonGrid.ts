// ============================================================
// useOctagonGrid — Memoized tessellation grid computation
// ============================================================

import { useMemo } from 'react';
import { buildGrid, computeSideLength } from '../utils/octagonGrid';
import { LEVELS } from '../config/levels';
import type { OctagonCell } from '../types/puzzle';

interface UseOctagonGridResult {
  cells: OctagonCell[];
  sideLength: number;
  pieceSize: number; // W = s + 2d
}

export function useOctagonGrid(
  level: number,
  boardWidth: number,
  boardHeight: number,
): UseOctagonGridResult {
  return useMemo(() => {
    const config = LEVELS[level - 1];
    if (!config || boardWidth === 0 || boardHeight === 0) {
      return { cells: [], sideLength: 0, pieceSize: 0 };
    }

    const s = computeSideLength(boardWidth, boardHeight, config.cols, config.rows);
    const d = (s * Math.SQRT2) / 2;
    const W = s + 2 * d;

    const cells = buildGrid(config.cols, config.rows, s, boardWidth, boardHeight);
    return { cells, sideLength: s, pieceSize: W };
  }, [level, boardWidth, boardHeight]);
}
