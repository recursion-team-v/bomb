import { Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';

export default class Player extends Schema {
  @type('string')
  sessionId: string;

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
  speed: number = Constants.INITIAL_PLAYER_SPEED;

  // ボムの破壊力
  @type('number')
  bombStrength: number;

  // 設置できるボムの個数
  @type('number')
  settableBombCount: number;

  inputQueue: any[] = [];

  constructor(sessionId: string, idx: number) {
    super();
    this.sessionId = sessionId;
    this.idx = idx;
    this.x = Constants.INITIAL_PLAYER_POSITION[idx].x;
    this.y = Constants.INITIAL_PLAYER_POSITION[idx].y;
    this.bombStrength = Constants.INITIAL_BOMB_STRENGTH;
    this.settableBombCount = Constants.INITIAL_SETTABLE_BOMB_COUNT;
  }
}
