// ============================================================
// GameBoard — The main puzzle board
// Layers: ghost canvas → drop cells → border canvas
// ============================================================

import { useRef, useEffect, useCallback } from 'react';
import { useCanvasRenderer } from '../hooks/useCanvasRenderer';
import type { OctagonCell } from '../types/puzzle';
import './GameBoard.css';

interface GameBoardProps {
  cells: OctagonCell[];
  cellMap: Map<string, OctagonCell>;
  occupancyMap: Record<string, string | null>;
  sideLength: number;
  imageUrl: string;
  boardWidth: number;
  boardHeight: number;
  active: boolean;
  /** Called with the map of cellId → drop-target div element */
  onCellElMap: (map: Map<string, HTMLElement>) => void;
}

export function GameBoard({
  cells,
  occupancyMap,
  cellMap,
  sideLength,
  imageUrl,
  boardWidth,
  boardHeight,
  active,
  onCellElMap,
}: GameBoardProps) {
  const ghostCanvasRef = useRef<HTMLCanvasElement>(null);
  const borderCanvasRef = useRef<HTMLCanvasElement>(null);
  const cellElsMapRef = useRef<Map<string, HTMLElement>>(new Map());

  useCanvasRenderer(
    ghostCanvasRef,
    borderCanvasRef,
    cells,
    occupancyMap,
    sideLength,
    active,
  );

  const setCellRef = useCallback(
    (el: HTMLElement | null, cellId: string) => {
      if (el) {
        cellElsMapRef.current.set(cellId, el);
      }
    },
    [],
  );

  // Report cell element map up once all cells are registered
  useEffect(() => {
    onCellElMap(cellElsMapRef.current);
  }, [cells, onCellElMap]);

  return (
    <div
      className="game-board"
      style={{ width: boardWidth, height: boardHeight }}
    >
      {/* Layer 1 — Ghost grid canvas */}
      <canvas
        ref={ghostCanvasRef}
        className="game-board__canvas game-board__canvas--ghost"
        width={boardWidth}
        height={boardHeight}
      />

      {/* Layer 2 — Drop cells */}
      <div
        className="game-board__cell-layer"
        style={{ width: boardWidth, height: boardHeight }}
      >
        {cells.map((cell) => {
          const occupantId = occupancyMap[cell.id] ?? null;
          const occupantCell = occupantId ? cellMap.get(occupantId) : null;
          const d = (sideLength * Math.SQRT2) / 2;
          const W = sideLength + 2 * d;

          return (
            <div
              key={cell.id}
              ref={(el) => setCellRef(el as HTMLElement | null, cell.id)}
              className="drop-cell"
              data-cell-id={cell.id}
              style={{
                position: 'absolute',
                left: cell.originX,
                top: cell.originY,
                width: W,
                height: W,
                clipPath: cell.clipPath,
              }}
            >
              {/* Placed piece shown as a background-image div inside the cell */}
              {occupantCell && (
                <div
                  data-piece-id={occupantId}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: `${boardWidth}px ${boardHeight}px`,
                    backgroundPosition: `-${occupantCell.bgOffsetX}px -${occupantCell.bgOffsetY}px`,
                    backgroundRepeat: 'no-repeat',
                    cursor: 'grab',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Layer 3 — Border canvas (pointer-events: none) */}
      <canvas
        ref={borderCanvasRef}
        className="game-board__canvas game-board__canvas--border"
        width={boardWidth}
        height={boardHeight}
      />
    </div>
  );
}
