import { Schema, type } from '@colyseus/schema';
import { v4 as uuidv4 } from 'uuid';

import * as Constants from '../../constants/constants';

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

  // ボムの種類
  @type('number')
  bombType: Constants.BOMB_TYPES;

  // ボムの破壊力
  @type('number')
  bombStrength: number;

  // ボムが爆発したかどうか
  @type('boolean')
  explodedState: boolean;

  // ボムが設置された時間
  @type('number')
  createdAt: number;

  // ボムが爆発する時間
  @type('number')
  removedAt: number;

  constructor(
    x: number,
    y: number,
    bombType: Constants.BOMB_TYPES,
    bombStrength: number,
    sessionId: string
  ) {
    super();
    this.id = uuidv4();
    this.sessionId = sessionId;
    this.x = x;
    this.y = y;
    this.bombType = bombType;
    this.bombStrength = bombStrength;
    this.explodedState = false;
    // 同期を取るため、オブジェクトの生成を遅らせる
    this.createdAt = Date.now() + Constants.OBJECT_CREATION_DELAY;
    this.removedAt = this.createdAt + Constants.BOMB_EXPLOSION_TIME;
  }

  isCreatedTime(): boolean {
    return this.createdAt <= Date.now();
  }

  isRemovedTime(): boolean {
    return this.removedAt <= Date.now();
  }

  // ボムが爆発したかどうか
  isExploded(): boolean {
    return this.explodedState;
  }

  // ボムを爆発させる(フラグの更新のみ)
  explode() {
    this.explodedState = true;
  }

  // 貫通系のボムかどうか
  isPenetrationBomb(): boolean {
    return this.bombType === Constants.BOMB_TYPE.PENETRATION;
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
