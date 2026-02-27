// ============================================================
// usePuzzleDrop — alugard-drop integration hook
//
// Strategy:
//  - Piece divs and drop-cell divs are BOTH registered as
//    alugard containers (each piece div IS a container of 1,
//    each drop cell is also a container of 1).
//  - We use the `moves` option to only allow pieces to move.
//  - We use the `accepts` option so only cells accept drops.
//  - On `drop`: dispatch PLACE_PIECE with pieceId + cellId.
//  - On `cancel`: dispatch PICKUP_PIECE to vacate the old cell.
//
// Note: alugard-drop works on DOM elements and handles pointer
//       events, follows the cursor with a CSS mirror clone that
//       naturally inherits clip-path + background-image.
// ============================================================

import { useEffect, useRef } from 'react';
import alugard from 'alugard-drop';
import type { Drake } from 'alugard-drop';
import type { Dispatch } from 'react';
import type { GameAction } from '../store/gameStore';

export interface UsePuzzleDropOptions {
  /** All piece <div> elements (data-piece-id attr required) */
  pieceEls: HTMLElement[];
  /** All drop-cell <div> elements (data-cell-id attr required) */
  cellEls: HTMLElement[];
  dispatch: Dispatch<GameAction>;
  /** Whether drag is currently enabled */
  enabled: boolean;
}

export function usePuzzleDrop({
  pieceEls,
  cellEls,
  dispatch,
  enabled,
}: UsePuzzleDropOptions): { drakeRef: React.MutableRefObject<Drake | null> } {
  const drakeRef = useRef<Drake | null>(null);

  useEffect(() => {
    if (!enabled || pieceEls.length === 0) return;

    // Tear down any previous drake
    drakeRef.current?.destroy();
    drakeRef.current = null;

    // Combine all elements into one alugard instance
    // Each div (piece or cell) is treated as a container
    const allEls = [...pieceEls, ...cellEls];

    const drake = alugard(allEls, {
      // Only pieces can be moved (they have data-piece-id)
      moves: (el) => !!el?.dataset.pieceId,
      // Only cell divs accept drops (they have data-cell-id)
      accepts: (_el, target) => !!target?.dataset.cellId,
      // Snap back if dropped outside a valid cell
      revertOnSpill: true,
      direction: 'horizontal',
    });

    drake.on('drop', (el, target, _source) => {
      const pieceId = el?.dataset.pieceId;
      const cellId  = target?.dataset.cellId;
      if (pieceId && cellId) {
        dispatch({ type: 'PLACE_PIECE', pieceId, cellId });
      }
    });

    drake.on('cancel', (el) => {
      const pieceId = el?.dataset.pieceId;
      if (pieceId) {
        dispatch({ type: 'PICKUP_PIECE', pieceId });
      }
    });

    drakeRef.current = drake;

    return () => {
      drake.destroy();
      drakeRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, pieceEls.length, cellEls.length, dispatch]);

  return { drakeRef };
}
