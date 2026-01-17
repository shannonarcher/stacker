import { Game } from './Game';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  MINOR_PRIZE_ROW,
  COLORS,
} from '../utils/constants';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number = 0;
  private gridOffsetX: number = 0;
  private gridOffsetY: number = 0;
  private dpr: number = 1;
  private flashTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    this.resize();
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    // Calculate cell size to fit grid with padding
    const padding = 20;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2 - 100; // Reserve space for UI

    const cellByWidth = availableWidth / GRID_WIDTH;
    const cellByHeight = availableHeight / GRID_HEIGHT;
    this.cellSize = Math.floor(Math.min(cellByWidth, cellByHeight));

    // Center the grid
    const gridWidth = this.cellSize * GRID_WIDTH;
    const gridHeight = this.cellSize * GRID_HEIGHT;
    this.gridOffsetX = (width - gridWidth) / 2;
    this.gridOffsetY = (height - gridHeight) / 2 + 30;

    // Disable image smoothing for crisp pixels
    this.ctx.imageSmoothingEnabled = false;
  }

  render(game: Game, time: number): void {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    // Clear canvas
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, width, height);

    // Update flash timer
    this.flashTimer = time;

    switch (game.state) {
      case 'title':
        this.renderTitle(game);
        break;
      case 'playing':
        this.renderGame(game);
        break;
      case 'gameover':
        this.renderGame(game);
        this.renderGameOver(game);
        break;
      case 'won':
        this.renderGame(game);
        this.renderWin(game);
        break;
    }
  }

  private renderTitle(game: Game): void {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    // Title
    this.ctx.fillStyle = COLORS.activeBlock;
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('STACKER', width / 2, height / 3);

    // High score
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = '20px monospace';
    this.ctx.fillText(`HIGH SCORE: ${game.highScore}`, width / 2, height / 2);

    // Tap to start (flashing)
    if (Math.floor(this.flashTimer * 2) % 2 === 0) {
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '24px monospace';
      this.ctx.fillText('TAP TO START', width / 2, height * 0.7);
    }
  }

  private renderGame(game: Game): void {
    this.renderGrid();
    this.renderPrizeLines();
    this.renderStackedBlocks(game);
    this.renderFallingBlocks(game);
    this.renderCelebrationBlocks(game);
    this.renderParticles(game);

    if (game.state === 'playing' && game.activeBlock) {
      this.renderActiveBlock(game);
    }

    this.renderScore(game);
  }

  private renderGrid(): void {
    const gap = 2;

    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        const x = this.gridOffsetX + col * this.cellSize;
        const y = this.gridOffsetY + (GRID_HEIGHT - 1 - row) * this.cellSize;

        this.ctx.fillStyle = COLORS.gridCell;
        this.ctx.fillRect(x + gap, y + gap, this.cellSize - gap * 2, this.cellSize - gap * 2);
      }
    }
  }

  private renderPrizeLines(): void {
    const lineWidth = 3;

    // Minor prize line
    const minorY = this.gridOffsetY + (GRID_HEIGHT - MINOR_PRIZE_ROW) * this.cellSize;
    this.ctx.strokeStyle = COLORS.minorPrizeLine;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(this.gridOffsetX - 10, minorY);
    this.ctx.lineTo(this.gridOffsetX + GRID_WIDTH * this.cellSize + 10, minorY);
    this.ctx.stroke();

    // Minor label
    this.ctx.fillStyle = COLORS.minorPrizeLine;
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('MINOR', this.gridOffsetX - 15, minorY + 4);

    // Major prize line
    const majorY = this.gridOffsetY;
    this.ctx.strokeStyle = COLORS.majorPrizeLine;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(this.gridOffsetX - 10, majorY);
    this.ctx.lineTo(this.gridOffsetX + GRID_WIDTH * this.cellSize + 10, majorY);
    this.ctx.stroke();

    // Major label
    this.ctx.fillStyle = COLORS.majorPrizeLine;
    this.ctx.fillText('MAJOR', this.gridOffsetX - 15, majorY + 4);
  }

  private renderStackedBlocks(game: Game): void {
    const gap = 2;
    const cells = game.grid.getAllFilledCells();

    for (const { row, col } of cells) {
      const x = this.gridOffsetX + col * this.cellSize;
      const y = this.gridOffsetY + (GRID_HEIGHT - 1 - row) * this.cellSize;

      this.ctx.fillStyle = COLORS.stackedBlock;
      this.ctx.fillRect(x + gap, y + gap, this.cellSize - gap * 2, this.cellSize - gap * 2);
    }
  }

  private renderActiveBlock(game: Game): void {
    if (!game.activeBlock) return;

    const gap = 2;
    const positions = game.activeBlock.getPositions();
    const row = game.activeBlock.row;

    for (const col of positions) {
      const x = this.gridOffsetX + col * this.cellSize;
      const y = this.gridOffsetY + (GRID_HEIGHT - 1 - row) * this.cellSize;

      this.ctx.fillStyle = COLORS.activeBlock;
      this.ctx.fillRect(x + gap, y + gap, this.cellSize - gap * 2, this.cellSize - gap * 2);
    }
  }

  private renderFallingBlocks(game: Game): void {
    const gap = 2;

    for (const fb of game.fallingBlocks) {
      const x = this.gridOffsetX + fb.col * this.cellSize;
      const y = this.gridOffsetY + (GRID_HEIGHT - 1 - fb.y) * this.cellSize;

      // Fade out as it falls
      const alpha = Math.max(0, 1 - (fb.y - fb.row) / 3);
      this.ctx.fillStyle = `rgba(255, 51, 51, ${alpha})`;
      this.ctx.fillRect(x + gap, y + gap, this.cellSize - gap * 2, this.cellSize - gap * 2);
    }
  }

  private renderCelebrationBlocks(game: Game): void {
    const gap = 2;
    const blockSize = this.cellSize - gap * 2;

    for (const cb of game.celebrationBlocks) {
      const x = this.gridOffsetX + cb.x * this.cellSize + this.cellSize / 2;
      const y = this.gridOffsetY + (GRID_HEIGHT - 1 - cb.y) * this.cellSize + this.cellSize / 2;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(cb.rotation);

      // Rainbow color based on original position
      const hue = (cb.col * 40 + cb.row * 20) % 360;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      this.ctx.fillRect(-blockSize / 2, -blockSize / 2, blockSize, blockSize);

      this.ctx.restore();
    }
  }

  private renderParticles(game: Game): void {
    for (const p of game.particles) {
      const x = this.gridOffsetX + p.x * this.cellSize;
      const y = this.gridOffsetY + (GRID_HEIGHT - 1 - p.y) * this.cellSize;
      const alpha = p.life / p.maxLife;
      const size = p.size * this.cellSize * alpha;

      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', '');

      // Handle hex colors
      if (p.color.startsWith('#')) {
        const r = parseInt(p.color.slice(1, 3), 16);
        const g = parseInt(p.color.slice(3, 5), 16);
        const b = parseInt(p.color.slice(5, 7), 16);
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      this.ctx.fill();
    }
  }

  private renderScore(game: Game): void {
    const width = this.canvas.width / this.dpr;

    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = '18px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`SCORE: ${game.score}`, width / 2, 10);

    this.ctx.fillStyle = COLORS.textDim;
    this.ctx.font = '14px monospace';
    this.ctx.fillText(`ROW ${game.currentRow + 1} / ${GRID_HEIGHT}`, width / 2, 35);
  }

  private renderGameOver(game: Game): void {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, width, height);

    // Game over text
    this.ctx.fillStyle = COLORS.activeBlock;
    this.ctx.font = 'bold 36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('GAME OVER', width / 2, height / 3);

    // Score
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = '24px monospace';
    this.ctx.fillText(`SCORE: ${game.score}`, width / 2, height / 2);

    // High score
    this.ctx.font = '18px monospace';
    this.ctx.fillText(`HIGH SCORE: ${game.highScore}`, width / 2, height / 2 + 35);

    // Tap to restart
    if (Math.floor(this.flashTimer * 2) % 2 === 0) {
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '20px monospace';
      this.ctx.fillText('TAP TO RESTART', width / 2, height * 0.75);
    }
  }

  private renderWin(game: Game): void {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    // Flashing overlay for celebration
    const flash = Math.sin(this.flashTimer * 10) * 0.1 + 0.5;
    this.ctx.fillStyle = `rgba(0, 255, 0, ${flash * 0.3})`;
    this.ctx.fillRect(0, 0, width, height);

    // Win text
    this.ctx.fillStyle = COLORS.majorPrizeLine;
    this.ctx.font = 'bold 36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('MAJOR PRIZE!', width / 2, height / 3);

    // Score
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = '24px monospace';
    this.ctx.fillText(`SCORE: ${game.score}`, width / 2, height / 2);

    // Tap to restart
    if (Math.floor(this.flashTimer * 2) % 2 === 0) {
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '20px monospace';
      this.ctx.fillText('TAP TO PLAY AGAIN', width / 2, height * 0.75);
    }
  }
}
