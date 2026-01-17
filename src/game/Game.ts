import { Block } from './Block';
import { Grid } from './Grid';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  STARTING_BLOCKS,
  MINOR_PRIZE_ROW,
  MAJOR_PRIZE_ROW,
  SCORING,
  GameState,
} from '../utils/constants';
import { getHighScore, updateHighScore } from '../utils/storage';

export interface StackResult {
  aligned: number[];
  fallen: number[];
  isPerfect: boolean;
  gameOver: boolean;
  minorPrize: boolean;
  majorPrize: boolean;
}

export class Game {
  grid: Grid;
  activeBlock: Block | null = null;
  currentRow: number = 0;
  score: number = 0;
  highScore: number = 0;
  state: GameState = 'title';
  lastStackResult: StackResult | null = null;
  fallingBlocks: { col: number; row: number; y: number; velocity: number }[] = [];
  celebrating: boolean = false;

  constructor() {
    this.grid = new Grid();
    this.highScore = getHighScore();
  }

  start(): void {
    this.grid.reset();
    this.currentRow = 0;
    this.score = 0;
    this.state = 'playing';
    this.lastStackResult = null;
    this.fallingBlocks = [];
    this.celebrating = false;
    this.spawnBlock(STARTING_BLOCKS);
  }

  private getMaxBlockWidth(row: number): number {
    // Force narrower blocks at top rows like the real arcade
    if (row >= 14) return 1; // Top row: 1 block
    if (row >= 12) return 2; // Rows 13-14: max 2 blocks
    return STARTING_BLOCKS;  // Lower rows: normal
  }

  private spawnBlock(width: number): void {
    // Cap width based on row
    const maxWidth = this.getMaxBlockWidth(this.currentRow);
    const actualWidth = Math.min(width, maxWidth);

    // Alternate direction based on row
    const direction: 1 | -1 = this.currentRow % 2 === 0 ? 1 : -1;
    const startX = direction === 1 ? 0 : GRID_WIDTH - actualWidth;
    this.activeBlock = new Block(this.currentRow, actualWidth, startX, direction);
  }

  update(deltaTime: number): void {
    if (this.state !== 'playing' || !this.activeBlock) return;

    this.activeBlock.update(deltaTime);

    // Update falling blocks animation
    for (let i = this.fallingBlocks.length - 1; i >= 0; i--) {
      const fb = this.fallingBlocks[i];
      fb.velocity += 20 * deltaTime; // gravity
      fb.y += fb.velocity * deltaTime;
      if (fb.y > GRID_HEIGHT + 2) {
        this.fallingBlocks.splice(i, 1);
      }
    }
  }

  triggerCelebration(): void {
    this.celebrating = true;
  }

  stack(): StackResult | null {
    if (this.state !== 'playing' || !this.activeBlock) return null;

    const blockPositions = this.activeBlock.getPositions();
    let alignedPositions: number[];

    if (this.currentRow === 0) {
      // First row - all blocks stay
      alignedPositions = blockPositions;
    } else {
      // Check alignment with row below
      const belowPositions = this.grid.getFilledPositions(this.currentRow - 1);
      alignedPositions = blockPositions.filter((pos) => belowPositions.includes(pos));
    }

    const fallenPositions = blockPositions.filter((pos) => !alignedPositions.includes(pos));

    // Add fallen blocks to animation
    for (const col of fallenPositions) {
      this.fallingBlocks.push({
        col,
        row: this.currentRow,
        y: this.currentRow,
        velocity: 0,
      });
    }

    // Check for game over
    const gameOver = alignedPositions.length === 0;

    if (gameOver) {
      this.state = 'gameover';
      updateHighScore(this.score);
      this.highScore = getHighScore();

      this.lastStackResult = {
        aligned: [],
        fallen: blockPositions,
        isPerfect: false,
        gameOver: true,
        minorPrize: false,
        majorPrize: false,
      };

      return this.lastStackResult;
    }

    // Place aligned blocks on grid
    this.grid.setRowPositions(this.currentRow, alignedPositions);

    // Calculate score
    const isPerfect = fallenPositions.length === 0 && this.currentRow > 0;
    this.score += SCORING.pointsPerRow;
    if (isPerfect) {
      this.score += SCORING.perfectBonus;
    }

    // Check for prizes
    const minorPrize = this.currentRow + 1 === MINOR_PRIZE_ROW;
    const majorPrize = this.currentRow + 1 === MAJOR_PRIZE_ROW;

    if (minorPrize) {
      this.score += SCORING.minorPrizeBonus;
    }
    if (majorPrize) {
      this.score += SCORING.majorPrizeBonus;
      this.state = 'won';
      updateHighScore(this.score);
      this.highScore = getHighScore();
    }

    this.lastStackResult = {
      aligned: alignedPositions,
      fallen: fallenPositions,
      isPerfect,
      gameOver: false,
      minorPrize,
      majorPrize,
    };

    // Move to next row if not won
    if (!majorPrize) {
      this.currentRow++;
      if (this.currentRow >= GRID_HEIGHT) {
        this.state = 'won';
        updateHighScore(this.score);
        this.highScore = getHighScore();
      } else {
        this.spawnBlock(alignedPositions.length);
      }
    }

    return this.lastStackResult;
  }

  getState(): GameState {
    return this.state;
  }

  getCurrentRow(): number {
    return this.currentRow;
  }

  getScore(): number {
    return this.score;
  }

  getHighScore(): number {
    return this.highScore;
  }
}
