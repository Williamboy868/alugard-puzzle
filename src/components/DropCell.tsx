// ============================================================
// DropCell — A target cell on the puzzle board
//
// Each DropCell is an absolutely-positioned div sized and
// positioned exactly like its OctagonCell counterpart.
// alugard-drop recognizes it as a drop target via data-cell-id.
// When occupied, it shows the placed PuzzlePiece inside it.
// ============================================================

import React, { forwardRef } from 'react';
import type { OctagonCell } from '../types/puzzle';
import { PuzzlePiece } from './PuzzlePiece';
import './DropCell.css';

interface DropCellProps {
  cell: OctagonCell;
  pieceSize: number;
  /** The piece that currently occupies this cell (null = empty) */
  occupantId: string | null;
  /** Lookup: pieceId → its OctagonCell (for image data) */
  cellMap: Map<string, OctagonCell>;
  imageUrl: string;
  imageBoardWidth: number;
  imageBoardHeight: number;
}

export const DropCell = forwardRef<HTMLDivElement, DropCellProps>(
  function DropCell(
    {
      cell,
      pieceSize,
      occupantId,
      cellMap,
      imageUrl,
      imageBoardWidth,
      imageBoardHeight,
    },
    ref,
  ) {
    const occupantCell = occupantId ? cellMap.get(occupantId) : null;
    const isHome = occupantId === cell.id;

    return (
      <div
        ref={ref}
        className="drop-cell"
        data-cell-id={cell.id}
        style={{
          position: 'absolute',
          left: cell.originX,
          top: cell.originY,
          width: pieceSize,
          height: pieceSize,
          clipPath: cell.clipPath,
        }}
      >
        {occupantCell && (
          <PuzzlePiece
            pieceId={occupantId!}
            cell={occupantCell}
            pieceSize={pieceSize}
            imageUrl={imageUrl}
            imageBoardWidth={imageBoardWidth}
            imageBoardHeight={imageBoardHeight}
            isHome={isHome}
          />
        )}
      </div>
    );
  },
);
