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
  frameKey = 0;

  @type('number')
  hp: number;

  @type('number')
  speed: number = Constants.INITIAL_PLAYER_SPEED;

  // ボムの破壊力
  @type('number')
  bombStrength: number;

  // 今設置できるボムの個数
  @type('number')
  settableBombCount: number;

  // 設置できるボムの最大個数
  @type('number')
  maxBombCount: number;

  inputQueue: any[] = [];

  constructor(sessionId: string, idx: number) {
    super();
    this.sessionId = sessionId;
    this.idx = idx;
    this.hp = Constants.INITIAL_PLAYER_HP;
    this.x = Constants.INITIAL_PLAYER_POSITION[idx].x;
    this.y = Constants.INITIAL_PLAYER_POSITION[idx].y;
    this.bombStrength = Constants.INITIAL_BOMB_STRENGTH;
    this.settableBombCount = Constants.INITIAL_SETTABLE_BOMB_COUNT;
    this.maxBombCount = Constants.INITIAL_SETTABLE_BOMB_COUNT;
  }

  // ダメージを受けてHPを減らします
  damage(damage: number) {
    this.hp - damage < 0 ? (this.hp = 0) : (this.hp -= damage);
  }

  // HPを回復します
  recoverHp(recover: number) {
    this.hp + recover > Constants.MAX_PLAYER_HP
      ? (this.hp = Constants.MAX_PLAYER_HP)
      : (this.hp += recover);
  }

  // プレイヤーが死んでいるかどうかを返します
  isAlive(): boolean {
    return this.hp > 0;
  }

  // 爆弾の破壊力を取得する
  getBombStrength(): number {
    return this.bombStrength;
  }

  // ボムの火力を変更する
  setBombStrength(bombStrength: number) {
    // TODO: 上限を設ける
    this.bombStrength = bombStrength;
  }

  // 速さを取得する
  getSpeed(): number {
    return this.speed;
  }

  // 速さを変更する
  setSpeed(speed: number) {
    // TODO: 上限を設ける
    this.speed = speed;
  }

  // ボムを設置できるかをチェックする
  canSetBomb(): boolean {
    return this.settableBombCount > 0;
  }

  // ボムを置ける最大数を増やす
  recoverSettableBombCount() {
    this.settableBombCount++;
  }

  // 現在設置しているボムの数を減らす
  consumeCurrentSetBombCount() {
    this.settableBombCount--;
  }

  // ボムの最大数を増やす
  increaseMaxBombCount() {
    // TODO: not implemented
    console.log('increaseMaxBombCount');
  }
}
