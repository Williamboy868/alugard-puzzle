// ============================================================
// Alugard Puzzle — Core Type Definitions
// ============================================================

export type GamePhase =
  | 'idle'        // Level selector visible
  | 'loading'     // Image loading
  | 'exploding'   // Pieces animate outward
  | 'scrambled'   // Pieces in tray, ready to play
  | 'solving'     // User is solving
  | 'won';        // Win screen

// ----------------------------------------------------------
// Grid / tessellation types
// ----------------------------------------------------------

/** An octagon cell in the 4.8.8 tessellation grid */
export interface OctagonCell {
  /** Unique ID: "oct_col_row" */
  id: string;
  /** Column index in the octagon grid (ignoring square fillers) */
  col: number;
  /** Row index in the octagon grid */
  row: number;
  /** Top-left x position on the board (px) */
  originX: number;
  /** Top-left y position on the board (px) */
  originY: number;
  /** Computed center x (px) */
  centerX: number;
  /** Computed center y (px) */
  centerY: number;
  /** CSS clip-path polygon() string for this octagon */
  clipPath: string;
  /** The background-position-x offset (px) for this piece's image slice */
  bgOffsetX: number;
  /** The background-position-y offset (px) for this piece's image slice */
  bgOffsetY: number;
  /** Neighbour cell IDs keyed by direction */
  neighbors: NeighborMap;
}

export type Direction = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';

export type NeighborMap = Partial<Record<Direction, string>>;

// ----------------------------------------------------------
// Piece types
// ----------------------------------------------------------

/** Runtime state of a single puzzle piece */
export interface PuzzlePiece {
  /** Same as the OctagonCell.id this piece originally belongs to */
  id: string;
  /** Which cell this piece is currently occupying (null = in tray) */
  currentCellId: string | null;
  /** Absolute x position in the play area (used during tray layout) */
  x: number;
  /** Absolute y position in the play area */
  y: number;
  /** True once the piece is dropped into a board cell */
  isPlaced: boolean;
  /** How many neighbours are also in their correct cell (for scoring) */
  correctNeighborCount: number;
}

// ----------------------------------------------------------
// Game State
// ----------------------------------------------------------

export interface LevelConfig {
  level: number;          // 1–5
  cols: number;
  rows: number;
  scatterPx: number;      // max randomness radius in tray
  imagePath: string;
  label: string;
}

export interface GameState {
  phase: GamePhase;
  level: number;          // 1–5
  imageIndex: number;     // 0–4
  /** All octagon cells (the solution grid) */
  grid: OctagonCell[];
  /** Flat piece map keyed by piece.id */
  pieces: Record<string, PuzzlePiece>;
  /** cellId → pieceId currently occupying it (null = empty) */
  occupancyMap: Record<string, string | null>;
  moveCount: number;
  elapsedSeconds: number;
  /** 0–1 */
  completionPct: number;
  /** Computed side-length used for this session */
  sideLength: number;
}

// ----------------------------------------------------------
// Geometry helpers (shared)
// ----------------------------------------------------------

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
