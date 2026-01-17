import { GRID_WIDTH, BASE_SPEED, SPEED_CONFIG } from '../utils/constants';

export class Block {
  x: number;
  width: number;
  row: number;
  direction: 1 | -1;
  speed: number;
  private accumulator: number = 0;

  constructor(row: number, width: number, startX: number = 0, direction: 1 | -1 = 1) {
    this.row = row;
    this.width = width;
    this.x = startX;
    this.direction = direction;
    this.speed = this.calculateSpeed(row);
  }

  private calculateSpeed(row: number): number {
    let multiplier = 1.0;
    for (const config of SPEED_CONFIG) {
      if (row >= config.row) {
        multiplier = config.speed;
      }
    }
    return BASE_SPEED * multiplier;
  }

  update(deltaTime: number): void {
    this.accumulator += deltaTime * this.speed;

    while (this.accumulator >= 1) {
      this.x += this.direction;
      this.accumulator -= 1;

      // Bounce off walls - reflect the movement
      if (this.x + this.width > GRID_WIDTH) {
        const overshoot = this.x + this.width - GRID_WIDTH;
        this.x = GRID_WIDTH - this.width - overshoot;
        this.direction = -1;
      } else if (this.x < 0) {
        const overshoot = -this.x;
        this.x = overshoot;
        this.direction = 1;
      }
    }
  }

  getPositions(): number[] {
    const positions: number[] = [];
    for (let i = 0; i < this.width; i++) {
      positions.push(this.x + i);
    }
    return positions;
  }

  clone(): Block {
    const cloned = new Block(this.row, this.width, this.x, this.direction);
    cloned.speed = this.speed;
    return cloned;
  }
}
