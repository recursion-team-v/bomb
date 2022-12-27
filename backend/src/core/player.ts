import { Schema, type } from '@colyseus/schema';

import * as Config from '../config/config';

export default class Player extends Schema {
  // プレイヤーの番号
  @type('number')
  idx: number;

  // プレイヤーの位置
  @type('number')
  x: number;

  @type('number')
  y: number;

  // プレイヤーのvelocity
  @type('number')
  vx: number = 0;

  @type('number')
  vy: number = 0;

  @type('number')
  speed: number = Config.INITIAL_PLAYER_SPEED;

  // ボムの破壊力
  @type('number')
  bombStrength: number;

  // 設置できるボムの個数
  @type('number')
  bombNum: number;

  constructor(idx: number) {
    super();
    this.idx = idx;
    this.x = Config.INITIAL_PLAYER_POSITION[idx].x;
    this.y = Config.INITIAL_PLAYER_POSITION[idx].y;
    this.bombStrength = Config.INITIAL_BOMB_STRENGTH;
    this.bombNum = Config.INITIAL_SET_BOMB_NUM;
  }
}
