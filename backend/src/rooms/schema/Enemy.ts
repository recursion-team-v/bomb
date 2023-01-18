import Player from './Player';
import * as Constants from '../../constants/constants';
import { TileToPixel, PixelToTile } from '../../utils/map';

export default class Enemy extends Player {
  nextX: number;
  nextY: number;

  constructor(sessionId: string, idx: number, name: string = Constants.DEFAULT_PLAYER_NAME) {
    super(sessionId, idx, name);
    this.nextX = this.x;
    this.nextY = this.y;
  }

  // の周囲のタイルを返します
  getSurroundingTiles(map: number[][]): {
    north: { x: number; y: number };
    south: { x: number; y: number };
    east: { x: number; y: number };
    west: { x: number; y: number };
  } {
    const { x, y } = PixelToTile(this.x, this.y);
    return {
      north: { x, y: y - 1 },
      south: { x, y: y + 1 },
      east: { x: x + 1, y },
      west: { x: x - 1, y },
    };
  }

  moveToNextTile(tileX: number, tileY: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    const pos = TileToPixel(tileX, tileY);
    this.nextX = pos.x;
    this.nextY = pos.y;
  }

  // 既に移動済みかどうかを返します
  isMoved() {
    return Math.abs(this.x - this.nextX) < 5 && Math.abs(this.y - this.nextY) < 5;
  }

  moveToDirection(): { up: boolean; down: boolean; left: boolean; right: boolean } {
    return {
      up: this.y > this.nextY,
      down: this.y < this.nextY,
      left: this.x > this.nextX,
      right: this.x < this.nextX,
    };
  }
}
