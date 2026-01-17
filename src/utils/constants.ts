export const GRID_WIDTH = 7;
export const GRID_HEIGHT = 15;
export const STARTING_BLOCKS = 3;
export const MINOR_PRIZE_ROW = 10;
export const MAJOR_PRIZE_ROW = 15;

export const SPEED_CONFIG = [
  { row: 1, speed: 1.0 },
  { row: 4, speed: 1.3 },
  { row: 7, speed: 1.6 },
  { row: 10, speed: 2.0 },
  { row: 13, speed: 2.5 },
];

export const BASE_SPEED = 5; // cells per second

export const COLORS = {
  background: '#0a0a0a',
  gridCell: '#1a1a1a',
  gridBorder: '#2a2a2a',
  activeBlock: '#ff3333',
  stackedBlock: '#cc2222',
  minorPrizeLine: '#ffcc00',
  majorPrizeLine: '#00ff00',
  text: '#ffffff',
  textDim: '#888888',
};

export const SCORING = {
  pointsPerRow: 100,
  perfectBonus: 50,
  minorPrizeBonus: 500,
  majorPrizeBonus: 2000,
};

export type GameState = 'title' | 'playing' | 'gameover' | 'won';
