import * as Constants from '../../constants/constants';
import { PixelToTile, TileToPixel } from '../../utils/map';
import Player from './Player';

export default class Enemy extends Player {
  // 次に移動する座標
  nextX: number;
  nextY: number;
  // 目的地
  goalX: number;
  goalY: number;

  constructor(sessionId: string, idx: number, name: string = Constants.DEFAULT_PLAYER_NAME) {
    super(sessionId, idx, name);
    this.nextX = Infinity;
    this.nextY = Infinity;
    this.goalX = Infinity;
    this.goalY = Infinity;
  }

  // x, y からタイルの位置を返します
  getTilePosition(): { x: number; y: number } {
    return PixelToTile(this.x, this.y);
  }

  getNextTilePosition(): { x: number; y: number } {
    return PixelToTile(this.nextX, this.nextY);
  }

  getGoalTilePosition(): { x: number; y: number } {
    return PixelToTile(this.goalX, this.goalY);
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

  setNext(tileX: number, tileY: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    const pos = TileToPixel(tileX, tileY);
    this.nextX = pos.x;
    this.nextY = pos.y;
  }

  setGoal(tileX: number, tileY: number) {
    const pos = TileToPixel(tileX, tileY);
    this.goalX = pos.x;
    this.goalY = pos.y;
  }

  // 次のタイルに移動済みかどうかを返します
  isMovedToNext(): boolean {
    return this.isMoved(this.nextX, this.nextY);
  }

  // 目的地に移動済みかどうかを返します
  isMovedToGoal(): boolean {
    return this.isMoved(this.goalX, this.goalY);
  }

  // 既に移動済みかどうかを返します
  isMoved(targetX: number, targetY: number): boolean {
    return (
      PixelToTile(this.x, this.y).x === PixelToTile(targetX, targetY).x &&
      PixelToTile(this.x, this.y).y === PixelToTile(targetX, targetY).y
    );
  }

  moveToDirection(): { up: boolean; down: boolean; left: boolean; right: boolean } {
    return {
      up: this.y > this.nextY,
      down: this.y < this.nextY,
      left: this.x > this.nextX,
      right: this.x < this.nextX,
    };
  }

  // キューを空にして enemy の移動を止める
  stop() {
    this.inputQueue = [];
  }
}
