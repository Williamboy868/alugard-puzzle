// ============================================================
// Alugard Puzzle — Game State Store (useReducer + Context)
// ============================================================

import React, {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
} from 'react';
import type { GameState, OctagonCell, PuzzlePiece } from '../types/puzzle';
import { checkWin, computeCompletion, computePieceNeighborScore } from '../utils/winCheck';

// ----------------------------------------------------------
// Actions
// ----------------------------------------------------------
export type GameAction =
  | { type: 'START_GAME'; grid: OctagonCell[]; pieces: PuzzlePiece[]; sideLength: number }
  | { type: 'SCRAMBLE' }
  | { type: 'PLACE_PIECE'; pieceId: string; cellId: string }
  | { type: 'PICKUP_PIECE'; pieceId: string }
  | { type: 'TICK' }
  | { type: 'WIN' }
  | { type: 'RESET' }
  | { type: 'SET_LEVEL'; level: number };

// ----------------------------------------------------------
// Initial state
// ----------------------------------------------------------
const initialState: GameState = {
  phase: 'idle',
  level: 1,
  imageIndex: 0,
  grid: [],
  pieces: {},
  occupancyMap: {},
  moveCount: 0,
  elapsedSeconds: 0,
  completionPct: 0,
  sideLength: 0,
};

// ----------------------------------------------------------
// Reducer
// ----------------------------------------------------------
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LEVEL': {
      return {
        ...initialState,
        level: action.level,
        imageIndex: action.level - 1,
      };
    }

    case 'START_GAME': {
      const pieces: Record<string, PuzzlePiece> = {};
      const occupancyMap: Record<string, string | null> = {};

      for (const cell of action.grid) {
        occupancyMap[cell.id] = null;
      }
      for (const piece of action.pieces) {
        pieces[piece.id] = piece;
      }

      return {
        ...state,
        phase: 'scrambled',
        grid: action.grid,
        pieces,
        occupancyMap,
        sideLength: action.sideLength,
        moveCount: 0,
        elapsedSeconds: 0,
        completionPct: 0,
      };
    }

    case 'PLACE_PIECE': {
      const { pieceId, cellId } = action;
      const piece = state.pieces[pieceId];
      if (!piece) return state;

      // Build new occupancy map
      const newOccupancy = { ...state.occupancyMap };

      // Free the cell this piece was previously in
      if (piece.currentCellId) {
        newOccupancy[piece.currentCellId] = null;
      }

      // A piece already in the target cell gets evicted back to tray
      const evictedId = newOccupancy[cellId];
      const newPieces = { ...state.pieces };

      if (evictedId && evictedId !== pieceId) {
        newPieces[evictedId] = {
          ...newPieces[evictedId],
          currentCellId: null,
          isPlaced: false,
        };
      }

      // Place new piece
      newOccupancy[cellId] = pieceId;
      const gridMap = new Map(state.grid.map((c) => [c.id, c]));
      const neighborScore = computePieceNeighborScore(cellId, newOccupancy, gridMap);

      newPieces[pieceId] = {
        ...piece,
        currentCellId: cellId,
        isPlaced: true,
        correctNeighborCount: neighborScore,
      };

      // Recompute neighbour scores for all affected neighbours
      const cell = gridMap.get(cellId);
      if (cell) {
        for (const neighborCellId of Object.values(cell.neighbors)) {
          if (!neighborCellId) continue;
          const neighborPieceId = newOccupancy[neighborCellId];
          if (neighborPieceId && newPieces[neighborPieceId]) {
            newPieces[neighborPieceId] = {
              ...newPieces[neighborPieceId],
              correctNeighborCount: computePieceNeighborScore(
                newPieces[neighborPieceId].currentCellId!,
                newOccupancy,
                gridMap,
              ),
            };
          }
        }
        // Also update the evicted piece's former neighbours
        if (piece.currentCellId) {
          const prevCell = gridMap.get(piece.currentCellId);
          if (prevCell) {
            for (const nCellId of Object.values(prevCell.neighbors)) {
              if (!nCellId) continue;
              const nPieceId = newOccupancy[nCellId];
              if (nPieceId && newPieces[nPieceId]) {
                newPieces[nPieceId] = {
                  ...newPieces[nPieceId],
                  correctNeighborCount: computePieceNeighborScore(
                    newPieces[nPieceId].currentCellId!,
                    newOccupancy,
                    gridMap,
                  ),
                };
              }
            }
          }
        }
      }

      const nextState: GameState = {
        ...state,
        phase: 'solving',
        pieces: newPieces,
        occupancyMap: newOccupancy,
        moveCount: state.moveCount + 1,
        completionPct: computeCompletion({ ...state, pieces: newPieces, occupancyMap: newOccupancy }),
      };

      // Check for win
      if (checkWin(nextState)) {
        return { ...nextState, phase: 'won' };
      }

      return nextState;
    }

    case 'PICKUP_PIECE': {
      const { pieceId } = action;
      const piece = state.pieces[pieceId];
      if (!piece || !piece.currentCellId) return state;

      const newOccupancy = { ...state.occupancyMap, [piece.currentCellId]: null };
      const newPieces = {
        ...state.pieces,
        [pieceId]: { ...piece, currentCellId: null, isPlaced: false },
      };

      return {
        ...state,
        pieces: newPieces,
        occupancyMap: newOccupancy,
        completionPct: computeCompletion({ ...state, pieces: newPieces, occupancyMap: newOccupancy }),
      };
    }

    case 'TICK': {
      if (state.phase !== 'solving' && state.phase !== 'scrambled') return state;
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    }

    case 'WIN': {
      return { ...state, phase: 'won' };
    }

    case 'RESET': {
      return { ...initialState, level: state.level, imageIndex: state.imageIndex };
    }

    default:
      return state;
  }
}

// ----------------------------------------------------------
// Context
// ----------------------------------------------------------
interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

export function useGameDispatch(): Dispatch<GameAction> {
  return useGame().dispatch;
}

export function useGameState(): GameState {
  return useGame().state;
}
