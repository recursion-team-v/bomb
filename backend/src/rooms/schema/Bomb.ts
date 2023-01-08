import { Schema, type } from '@colyseus/schema';
import { v4 as uuidv4 } from 'uuid';

import * as Constants from '../../constants/constants';
import BombInterface from '../../interfaces/bomb';

export class Bomb extends Schema {
  // 位置
  @type('string')
  id: string;

  @type('string')
  sessionId: string;

  @type('number')
  x: number;

  @type('number')
  y: number;

  // ボムの破壊力
  @type('number')
  bombStrength: number;

  // ボムが設置された時間
  @type('number')
  createdAt: number;

  // ボムが爆発する時間
  @type('number')
  explodedAt: number;

  constructor(x: number, y: number, bombStrength: number, sessionId: string) {
    super();
    this.id = uuidv4();
    this.sessionId = sessionId;
    this.x = x;
    this.y = y;
    this.bombStrength = bombStrength;
    this.createdAt = Date.now();
    this.explodedAt = this.createdAt + Constants.BOMB_EXPLOSION_TIME;
  }

  updateBombStrength(strength: number) {
    this.bombStrength = strength;
  }

  isExplodedTime(): boolean {
    return this.explodedAt <= Date.now();
  }

  // TODO: not implemented
  detonated(bomb: BombInterface) {
    console.log('detonated');
  }
}

// TODO: クライアントもこっちを参照するようにする
// 指定の座標から設置可能な座標を返します
export function getSettablePosition(x: number, y: number): { bx: number; by: number } {
  const bx = Math.floor(x / Constants.TILE_WIDTH) * Constants.TILE_WIDTH + Constants.TILE_WIDTH / 2;
  const by =
    Math.floor(y / Constants.TILE_HEIGHT) * Constants.TILE_HEIGHT + Constants.TILE_HEIGHT / 2;

  return { bx, by };
}
