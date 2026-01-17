export const GRID_WIDTH = 7;
export const GRID_HEIGHT = 15;
export const STARTING_BLOCKS = 3;
export const MINOR_PRIZE_ROW = 10;
export const MAJOR_PRIZE_ROW = 15;

export const SPEED_CONFIG = [
  { row: 1, speed: 1.0 },
  { row: 3, speed: 1.4 },
  { row: 5, speed: 1.8 },
  { row: 7, speed: 2.3 },
  { row: 9, speed: 2.9 },
  { row: 11, speed: 3.6 },
  { row: 13, speed: 4.5 },
  { row: 14, speed: 5.5 },
];

export const BASE_SPEED = 7; // cells per second

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
