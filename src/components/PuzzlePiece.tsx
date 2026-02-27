// ============================================================
// PuzzlePiece — A single absolutely-positioned octagon piece
//
// This is a simple presentational component. Its clipping and
// background image offsets make it look like an octagon slice
// of the puzzle image. alugard-drop drags this div.
// ============================================================

import React, { forwardRef } from 'react';
import type { OctagonCell } from '../types/puzzle';
import './PuzzlePiece.css';

interface PuzzlePieceProps {
  pieceId: string;
  cell: OctagonCell;       // The cell this piece BELONGS TO (image data)
  pieceSize: number;       // W = s + 2d in px
  imageUrl: string;
  imageBoardWidth: number; // The board width (for background-size)
  imageBoardHeight: number;
  /** Position in the current container (tray or board) */
  style?: React.CSSProperties;
  isHome: boolean;         // piece is in its correct cell
}

export const PuzzlePiece = forwardRef<HTMLDivElement, PuzzlePieceProps>(
  function PuzzlePiece(
    {
      pieceId,
      cell,
      pieceSize,
      imageUrl,
      imageBoardWidth,
      imageBoardHeight,
      style,
      isHome,
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={`puzzle-piece${isHome ? ' puzzle-piece--home' : ''}`}
        data-piece-id={pieceId}
        style={{
          width: pieceSize,
          height: pieceSize,
          clipPath: cell.clipPath,
          backgroundImage: `url(${imageUrl})`,
          // Scale the full image to the board dimensions
          backgroundSize: `${imageBoardWidth}px ${imageBoardHeight}px`,
          // Shift the image so the correct slice shows
          backgroundPosition: `-${cell.bgOffsetX}px -${cell.bgOffsetY}px`,
          backgroundRepeat: 'no-repeat',
          cursor: 'grab',
          position: 'relative',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  },
);
