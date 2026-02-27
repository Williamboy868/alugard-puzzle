// ============================================================
// PieceTray — Holds all unplaced puzzle pieces
// ============================================================

import type { PuzzlePiece as PuzzlePieceType, OctagonCell } from '../types/puzzle';
import type { Dispatch } from 'react';
import type { GameAction } from '../store/gameStore';
import './PieceTray.css';

interface PieceTrayProps {
  pieces: PuzzlePieceType[];
  cellMap: Map<string, OctagonCell>;
  pieceSize: number;
  imageUrl: string;
  imageBoardWidth: number;
  imageBoardHeight: number;
  dispatch: Dispatch<GameAction>;
  /** Called with this tray's container element for alugard-drop */
  onTrayEl: (el: HTMLElement | null) => void;
}

export function PieceTray({
  pieces,
  cellMap,
  pieceSize,
  imageUrl,
  imageBoardWidth,
  imageBoardHeight,
  onTrayEl,
}: PieceTrayProps) {
  // Only show pieces NOT placed on the board
  const trayPieces = pieces.filter((p) => !p.isPlaced);

  return (
    <div className="piece-tray">
      <div className="piece-tray__label">
        <span className="piece-tray__count">{trayPieces.length} pieces remaining</span>
      </div>
      <div
        className="piece-tray__grid"
        id="piece-tray-grid"
        ref={onTrayEl}
      >
        {trayPieces.map((piece) => {
          const cell = cellMap.get(piece.id);
          if (!cell) return null;
          return (
            <div
              key={piece.id}
              data-piece-id={piece.id}
              className="tray-piece"
              style={{
                width: pieceSize,
                height: pieceSize,
                clipPath: cell.clipPath,
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: `${imageBoardWidth}px ${imageBoardHeight}px`,
                backgroundPosition: `-${cell.bgOffsetX}px -${cell.bgOffsetY}px`,
                backgroundRepeat: 'no-repeat',
                cursor: 'grab',
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
