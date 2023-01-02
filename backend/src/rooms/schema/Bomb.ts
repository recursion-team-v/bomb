import { Schema, type } from '@colyseus/schema';

import Player from './Player';

export default class Bomb extends Schema {
  // 位置
  @type('number')
  x: number;

  @type('number')
  y: number;

  // ボムの破壊力
  @type('number')
  bombStrength: number;

  // ボムを設置したプレイヤー
  @type({ map: Player })
  owner: Player;

  inputQueue: any[] = [];

  constructor(owner: Player, x: number, y: number, bombStrength: number) {
    super();
    this.owner = owner;
    this.x = x;
    this.y = y;
    this.bombStrength = bombStrength;
  }

  updateBombStrength(strength: number) {
    this.bombStrength = strength;
  }
}
