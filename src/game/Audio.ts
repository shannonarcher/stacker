type SoundName = 'stack' | 'perfect' | 'fall' | 'minor' | 'major' | 'gameover';

export class Audio {
  private ctx: AudioContext | null = null;
  private unlocked: boolean = false;
  private enabled: boolean = true;

  constructor() {
    // Defer AudioContext creation until user interaction
  }

  unlock(): void {
    if (this.unlocked) return;

    try {
      this.ctx = new AudioContext();
      this.unlocked = true;

      // Resume if suspended
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch {
      // Web Audio not supported
    }
  }

  private createOscillator(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    gain: number = 0.3
  ): void {
    if (!this.ctx || !this.enabled) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  play(sound: SoundName): void {
    if (!this.ctx || !this.enabled) return;

    switch (sound) {
      case 'stack':
        this.createOscillator(440, 0.08, 'square', 0.2);
        break;

      case 'perfect':
        this.createOscillator(523, 0.1, 'square', 0.25);
        setTimeout(() => this.createOscillator(659, 0.1, 'square', 0.25), 50);
        setTimeout(() => this.createOscillator(784, 0.15, 'square', 0.25), 100);
        break;

      case 'fall':
        this.createOscillator(200, 0.15, 'sawtooth', 0.15);
        break;

      case 'minor':
        // Celebration jingle
        [523, 659, 784, 1047].forEach((freq, i) => {
          setTimeout(() => this.createOscillator(freq, 0.2, 'square', 0.2), i * 100);
        });
        break;

      case 'major':
        // Big win fanfare
        [523, 659, 784, 1047, 784, 1047, 1319].forEach((freq, i) => {
          setTimeout(() => this.createOscillator(freq, 0.25, 'square', 0.25), i * 120);
        });
        break;

      case 'gameover':
        this.createOscillator(200, 0.3, 'sawtooth', 0.2);
        setTimeout(() => this.createOscillator(150, 0.4, 'sawtooth', 0.2), 200);
        break;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
