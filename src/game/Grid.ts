import { GRID_WIDTH, GRID_HEIGHT } from '../utils/constants';

export class Grid {
  private cells: boolean[][];

  constructor() {
    this.cells = this.createEmptyGrid();
  }

  private createEmptyGrid(): boolean[][] {
    const grid: boolean[][] = [];
    for (let row = 0; row < GRID_HEIGHT; row++) {
      grid.push(new Array(GRID_WIDTH).fill(false));
    }
    return grid;
  }

  reset(): void {
    this.cells = this.createEmptyGrid();
  }

  setCell(row: number, col: number, value: boolean): void {
    if (row >= 0 && row < GRID_HEIGHT && col >= 0 && col < GRID_WIDTH) {
      this.cells[row][col] = value;
    }
  }

  getCell(row: number, col: number): boolean {
    if (row >= 0 && row < GRID_HEIGHT && col >= 0 && col < GRID_WIDTH) {
      return this.cells[row][col];
    }
    return false;
  }

  getRow(row: number): boolean[] {
    if (row >= 0 && row < GRID_HEIGHT) {
      return [...this.cells[row]];
    }
    return new Array(GRID_WIDTH).fill(false);
  }

  setRowPositions(row: number, positions: number[]): void {
    if (row >= 0 && row < GRID_HEIGHT) {
      this.cells[row] = new Array(GRID_WIDTH).fill(false);
      for (const pos of positions) {
        if (pos >= 0 && pos < GRID_WIDTH) {
          this.cells[row][pos] = true;
        }
      }
    }
  }

  getFilledPositions(row: number): number[] {
    const positions: number[] = [];
    if (row >= 0 && row < GRID_HEIGHT) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        if (this.cells[row][col]) {
          positions.push(col);
        }
      }
    }
    return positions;
  }

  getAllFilledCells(): { row: number; col: number }[] {
    const filled: { row: number; col: number }[] = [];
    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        if (this.cells[row][col]) {
          filled.push({ row, col });
        }
      }
    }
    return filled;
  }

  countFilledInRow(row: number): number {
    if (row >= 0 && row < GRID_HEIGHT) {
      return this.cells[row].filter(Boolean).length;
    }
    return 0;
  }
}
