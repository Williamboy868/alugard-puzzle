// ============================================================
// GameScreen — Main orchestrator for an active puzzle session
//
// alugard-drop integration:
//   One drake instance manages the tray div + all cell divs.
//   - Tray div (id="piece-tray-grid") = source container
//   - Cell divs (data-cell-id) = target containers
//   - Piece divs (data-piece-id) = draggable items
//   moves()   returns true only for elements with data-piece-id
//   accepts() returns true only for containers with data-cell-id OR the tray
// ============================================================

import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import alugard from 'alugard-drop';
import type { Drake } from 'alugard-drop';
import { GameBoard } from './GameBoard';
import { PieceTray } from './PieceTray';
import { HUD } from './HUD';
import { WinScreen } from './WinScreen';
import { useOctagonGrid } from '../hooks/useOctagonGrid';
import { useGameTimer } from '../hooks/useGameTimer';
import { useGameState, useGameDispatch } from '../store/gameStore';
import { createAndScramblePieces } from '../utils/scramble';
import { LEVELS } from '../config/levels';
import type { OctagonCell } from '../types/puzzle';
import './GameScreen.css';

interface GameScreenProps {
  onMenu: () => void;
}

const BOARD_W = 620;
const BOARD_H = 480;

export function GameScreen({ onMenu }: GameScreenProps) {
  const state = useGameState();
  const dispatch = useGameDispatch();

  const config = LEVELS[state.level - 1];
  const { cells, sideLength, pieceSize } = useOctagonGrid(state.level, BOARD_W, BOARD_H);

  const cellMap = useMemo<Map<string, OctagonCell>>(
    () => new Map(cells.map((c) => [c.id, c])),
    [cells],
  );

  // Refs to droppable containers
  const trayElRef = useRef<HTMLElement | null>(null);
  const cellElMapRef = useRef<Map<string, HTMLElement>>(new Map());
  const drakeRef = useRef<Drake | null>(null);

  // Timer
  useGameTimer(state.phase, dispatch);

  // Image Loading State
  const [imageLoaded, setImageLoaded] = React.useState(false);

  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.src = config?.imagePath ?? '/images/placeholder.jpg';
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true); // Fallback so we don't hang forever
  }, [config?.imagePath]);

  // Flag to differentiate genuine user cancels (spills) from our DOM revert
  const isRevertingDrop = useRef(false);

  // ---- alugard-drop —————————————————————————————————————
  const initDrake = useCallback(() => {
    drakeRef.current?.destroy();

    const trayEl = trayElRef.current;
    if (!trayEl) return;

    const cellEls = Array.from(cellElMapRef.current.values());
    const allContainers: HTMLElement[] = [trayEl, ...cellEls];

    const drake = alugard(allContainers, {
      // Only divs with data-piece-id can be dragged
      moves: (el) => !!el?.dataset.pieceId,
      // Accept drops into cells (data-cell-id) OR back into the tray
      accepts: (_el, target) =>
        !!target?.dataset.cellId || target?.id === 'piece-tray-grid',
      revertOnSpill: true,
      direction: 'horizontal',
    });

    drake.on('drop', (el, target, _source) => {
      // 1. Visually revert the drop immediately using the library's built-in mechanism.
      //    This restores the element exactly to its original DOM sibling position,
      //    preventing React from crashing with 'NotFoundError' during reconciliation!
      isRevertingDrop.current = true;
      drake.cancel(true);
      isRevertingDrop.current = false;

      const pieceId = el?.dataset.pieceId;
      const cellId = target?.dataset.cellId;

      // 2. Dispatch state updates (React will update the DOM correctly now)
      if (pieceId && cellId) {
        dispatch({ type: 'PLACE_PIECE', pieceId, cellId });
      } else if (pieceId && target?.id === 'piece-tray-grid') {
        dispatch({ type: 'PICKUP_PIECE', pieceId });
      }
    });

    // Auto-scroll logic variables
    let scrollAnimationFrame: number | null = null;
    let isDragging = false;
    let currentMouseY = 0;

    const handleAutoScroll = () => {
      if (!isDragging) return;

      const edgeThreshold = 60; // Distance from edge to trigger scroll
      const scrollSpeed = 8; // Pixels per frame
      const windowHeight = window.innerHeight;

      // Scroll up
      if (currentMouseY < edgeThreshold) {
        window.scrollBy(0, -scrollSpeed);
      }
      // Scroll down
      else if (currentMouseY > windowHeight - edgeThreshold) {
        window.scrollBy(0, scrollSpeed);
      }

      scrollAnimationFrame = requestAnimationFrame(handleAutoScroll);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      if ('touches' in e) {
        currentMouseY = e.touches[0].clientY;
      } else {
        currentMouseY = e.clientY;
      }
    };

    drake.on('drag', () => {
      isDragging = true;
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('touchmove', handleMouseMove, { passive: true });
      scrollAnimationFrame = requestAnimationFrame(handleAutoScroll);
    });

    drake.on('dragend', () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove);
      if (scrollAnimationFrame !== null) {
        cancelAnimationFrame(scrollAnimationFrame);
        scrollAnimationFrame = null;
      }
    });

    drake.on('cancel', (el, _container, source) => {
      if (isRevertingDrop.current) return; // Ignore fake cancels from our DOM revert!

      // Only pick it up if it was actually canceled from a board cell
      // and not just clicked in the tray.
      const pieceId = el?.dataset.pieceId;
      if (pieceId && source && source.id !== 'piece-tray-grid') {
        dispatch({ type: 'PICKUP_PIECE', pieceId });
      }
    });

    drakeRef.current = drake;
  }, [dispatch]);

  // Reinitialise drake whenever containers change
  useEffect(() => {
    if (state.phase === 'scrambled' || state.phase === 'solving') {
      initDrake();
    }
    return () => {
      drakeRef.current?.destroy();
      drakeRef.current = null;
    };
  }, [state.phase, cells, initDrake]);

  // ---- Auto-start ———————————————————————————————————————
  const hasStarted = useRef(false);

  const handleStart = useCallback(() => {
    if (cells.length === 0 || sideLength === 0) return;
    const trayRect = { width: BOARD_W, height: 200 };
    const pieces = createAndScramblePieces(cells, config, trayRect, pieceSize);
    dispatch({ type: 'START_GAME', grid: cells, pieces, sideLength });
  }, [cells, sideLength, pieceSize, config, dispatch]);

  useEffect(() => {
    if (!hasStarted.current && cells.length > 0 && state.phase === 'idle') {
      hasStarted.current = true;
      handleStart();
    }
  }, [cells, state.phase, handleStart]);

  useEffect(() => {
    if (state.phase === 'idle') hasStarted.current = false;
  }, [state.phase]);

  // ---- Callbacks to collect DOM refs ———————————————————
  const handleTrayEl = useCallback((el: HTMLElement | null) => {
    trayElRef.current = el;
  }, []);

  const handleCellElMap = useCallback((map: Map<string, HTMLElement>) => {
    cellElMapRef.current = map;
  }, []);

  // ---- Win handlers ————————————————————————————————————
  const handleNextLevel = useCallback(() => {
    dispatch({ type: 'SET_LEVEL', level: state.level + 1 });
  }, [dispatch, state.level]);

  const handleReplay = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const pieces = useMemo(() => Object.values(state.pieces), [state.pieces]);
  const imageUrl = config?.imagePath ?? '/images/placeholder.jpg';

  return (
    <div className="game-screen">
      <HUD
        level={state.level}
        levelLabel={config?.label ?? ''}
        elapsedSeconds={state.elapsedSeconds}
        moveCount={state.moveCount}
        completionPct={state.completionPct}
      />

      <div className="game-screen__board-wrap">
        {!imageLoaded && (
          <div className="game-screen__loading">
            <div className="game-screen__spinner" />
            <span>Loading image...</span>
          </div>
        )}
        <div style={{ visibility: imageLoaded ? 'visible' : 'hidden', display: 'contents' }}>
          <GameBoard
            cells={cells}
            cellMap={cellMap}
            pieces={state.pieces}
            occupancyMap={state.occupancyMap}
            pieceSize={pieceSize}
            sideLength={sideLength}
            imageUrl={imageUrl}
            boardWidth={BOARD_W}
            boardHeight={BOARD_H}
            active={state.phase === 'solving' || state.phase === 'scrambled'}
            dispatch={dispatch}
            onCellElMap={handleCellElMap}
          />
        </div>
      </div>

      <div style={{ visibility: imageLoaded ? 'visible' : 'hidden', display: 'contents' }}>
        <PieceTray
          pieces={pieces}
          cellMap={cellMap}
          pieceSize={pieceSize}
          imageUrl={imageUrl}
          imageBoardWidth={BOARD_W}
          imageBoardHeight={BOARD_H}
          dispatch={dispatch}
          onTrayEl={handleTrayEl}
        />
      </div>

      <button className="game-screen__menu-btn" onClick={onMenu}>
        ← Menu
      </button>

      {state.phase === 'won' && (
        <WinScreen
          level={state.level}
          levelLabel={config?.label ?? ''}
          elapsedSeconds={state.elapsedSeconds}
          moveCount={state.moveCount}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onMenu={onMenu}
          hasNextLevel={state.level < 5}
        />
      )}
    </div>
  );
}
