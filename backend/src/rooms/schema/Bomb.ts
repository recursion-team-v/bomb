import { Schema, type } from '@colyseus/schema';
import { v4 as uuidv4 } from 'uuid';

import * as Constants from '../../constants/constants';
import BombInterface from '../../interfaces/bomb';
import Player from './Player';

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

  // ボムを設置したプレイヤー
  @type(Player)
  owner: Player;

  // ボムが設置された時間
  @type('number')
  createdAt: number;

  constructor(owner: Player, x: number, y: number, bombStrength: number) {
    super();
    this.id = uuidv4();
    this.sessionId = owner.sessionId;
    this.owner = owner;
    this.x = x;
    this.y = y;
    this.bombStrength = bombStrength;
    this.createdAt = Date.now();
  }

  updateBombStrength(strength: number) {
    this.bombStrength = strength;
  }

  isExploded(): boolean {
    return this.createdAt + Constants.BOMB_EXPLOSION_TIME <= Date.now();
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
