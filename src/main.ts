import { Game } from './game/Game';
import { Renderer } from './game/Renderer';
import { Input } from './game/Input';
import { Audio } from './game/Audio';

class StackerApp {
  private game: Game;
  private renderer: Renderer;
  private input: Input;
  private audio: Audio;
  private lastTime: number = 0;
  private running: boolean = true;

  constructor() {
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas element not found');

    this.game = new Game();
    this.renderer = new Renderer(canvas);
    this.input = new Input(canvas);
    this.audio = new Audio();

    this.setupInput();
    this.setupResize();
    this.setupVisibility();

    // Start game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  private setupInput(): void {
    this.input.onAction(() => {
      // Unlock audio on first interaction
      this.audio.unlock();

      switch (this.game.state) {
        case 'title':
          this.game.start();
          break;

        case 'playing':
          const result = this.game.stack();
          if (result) {
            if (result.gameOver) {
              this.audio.play('gameover');
              this.input.triggerHaptic([50, 50, 50]);
            } else if (result.majorPrize) {
              this.audio.play('major');
              this.input.triggerHaptic([100, 50, 100, 50, 200]);
              this.game.triggerCelebration();
            } else if (result.minorPrize) {
              this.audio.play('minor');
              this.input.triggerHaptic([50, 30, 50, 30, 100]);
            } else if (result.isPerfect) {
              this.audio.play('perfect');
              this.input.triggerHaptic(30);
            } else if (result.fallen.length > 0) {
              this.audio.play('fall');
              this.input.triggerHaptic(15);
            } else {
              this.audio.play('stack');
              this.input.triggerHaptic(10);
            }
          }
          break;

        case 'gameover':
        case 'won':
          this.game.start();
          break;
      }
    });
  }

  private setupResize(): void {
    window.addEventListener('resize', () => {
      this.renderer.resize();
    });
  }

  private setupVisibility(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.running = false;
      } else {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
      }
    });
  }

  private loop(currentTime: number): void {
    if (!this.running) return;

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.game.update(deltaTime);
    this.renderer.render(this.game, currentTime / 1000);

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new StackerApp());
} else {
  new StackerApp();
}
