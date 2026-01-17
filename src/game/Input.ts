export type InputCallback = () => void;

export class Input {
  private callback: InputCallback | null = null;
  private enabled: boolean = true;

  constructor(element: HTMLElement) {
    this.setupTouchEvents(element);
    this.setupMouseEvents(element);
    this.setupKeyboardEvents();
  }

  private setupTouchEvents(element: HTMLElement): void {
    element.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        this.trigger();
      },
      { passive: false }
    );

    // Prevent default touch behaviors
    element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    element.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
  }

  private setupMouseEvents(element: HTMLElement): void {
    element.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.trigger();
    });

    // Prevent context menu
    element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private setupKeyboardEvents(): void {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.trigger();
      }
    });
  }

  private trigger(): void {
    if (this.enabled && this.callback) {
      this.callback();
    }
  }

  onAction(callback: InputCallback): void {
    this.callback = callback;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  triggerHaptic(pattern: number | number[] = 10): void {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Vibration not supported
      }
    }
  }
}
