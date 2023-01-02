import { Schema, type } from '@colyseus/schema';
import { v4 as uuidv4 } from 'uuid';

import * as Constants from '../../constants/constants';
import Player from './Player';

export class Bomb extends Schema {
  // 位置
  @type('string')
  id: string;

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

  constructor(owner: Player, x: number, y: number, bombStrength: number) {
    super();
    this.id = uuidv4();
    this.owner = owner;
    this.x = x;
    this.y = y;
    this.bombStrength = bombStrength;
  }

  updateBombStrength(strength: number) {
    this.bombStrength = strength;
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
