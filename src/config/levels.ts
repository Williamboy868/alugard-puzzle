// ============================================================
// Alugard Puzzle — Level Configurations
// ============================================================

import type { LevelConfig } from '../types/puzzle';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    cols: 4,
    rows: 4,
    scatterPx: 80,
    imagePath: '/images/level1.jpg',
    label: 'Mountain Lake',
  },
  {
    level: 2,
    cols: 5,
    rows: 5,
    scatterPx: 120,
    imagePath: '/images/level2.jpg',
    label: 'Coral Reef',
  },
  {
    level: 3,
    cols: 6,
    rows: 6,
    scatterPx: 160,
    imagePath: '/images/level3.jpg',
    label: 'Ancient Forest',
  },
  {
    level: 4,
    cols: 7,
    rows: 7,
    scatterPx: 200,
    imagePath: '/images/level4.jpg',
    label: 'Neon City',
  },
  {
    level: 5,
    cols: 8,
    rows: 8,
    scatterPx: 260,
    imagePath: '/images/level5.jpg',
    label: 'Galaxy Nebula',
  },
];

export const PLACEHOLDER_IMAGE = '/images/placeholder.jpg';
