import { Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';
import { getInitialPlayerPos } from '../../utils/getInitialPlayerPos';
import { PixelToTile } from '../../utils/map';
import { validateAndFixUserName } from '../../utils/validation';
import { IS_BACKEND_DEBUG } from '../../index';

export default class Player extends Schema {
  @type('string')
  sessionId: string;

  @type('number')
  gameState: Constants.PLAYER_GAME_STATE_TYPE = Constants.PLAYER_GAME_STATE.WAITING;

  @type('string')
  character: string;

  // プレイヤーの番号
  @type('number')
  idx: number;

  @type('string')
  name: string;

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

  @type('number')
  bombType: Constants.BOMB_TYPES;

  // ボムの破壊力
  @type('number')
  bombStrength: number;

  // 今設置しているボムの個数
  @type('number')
  currentSetBombCount: number;

  // 設置できるボムの最大個数
  @type('number')
  maxBombCount: number;

  // 取得したアイテムの種類と個数
  getItemMap: Map<Constants.ITEM_TYPES, number>;

  // 最後に攻撃を受けた時間
  @type('number')
  lastDamagedAt: number;

  // 死んだ時間
  @type('number')
  diedAt: number;

  // CPU
  @type('boolean')
  isCPU = false;

  inputQueue: any[] = [];

  constructor(sessionId: string, idx: number, name: string = '') {
    super();
    this.sessionId = sessionId;
    this.idx = idx;
    this.character = Constants.CHARACTERS[idx];
    this.name = validateAndFixUserName(name);
    this.hp = Constants.INITIAL_PLAYER_HP;

    const { x, y } = getInitialPlayerPos(
      Constants.DEFAULT_TILE_ROWS,
      Constants.DEFAULT_TILE_COLS,
      this.idx
    );
    this.x = x;
    this.y = y;

    this.bombType = Constants.BOMB_TYPE.NORMAL;
    this.bombStrength = Constants.INITIAL_BOMB_STRENGTH;
    this.currentSetBombCount = 0;
    this.maxBombCount = Constants.INITIAL_SETTABLE_BOMB_COUNT;
    this.getItemMap = new Map<Constants.ITEM_TYPES, number>();
    this.lastDamagedAt = 0;
    this.diedAt = Infinity;
  }

  // ダメージを受けてHPを減らします
  damaged(damage: number) {
    // 一定時間無敵の場合は被弾しない
    if (this.isInvincible()) return;

    this.hp - damage < 0 ? (this.hp = 0) : (this.hp -= damage);
    if (this.isDead()) this.diedAt = Date.now();

    this.updateLastDamagedAt();
  }

  // プレイヤーが無敵かどうかを返します
  isInvincible(): boolean {
    return this.lastDamagedAt + Constants.PLAYER_INVINCIBLE_TIME > Date.now();
  }

  // 最後にダメージを受けた時間を更新します
  updateLastDamagedAt() {
    this.lastDamagedAt = Date.now();
  }

  // HPを回復します
  healed(recover: number) {
    this.hp + recover > Constants.MAX_PLAYER_HP
      ? (this.hp = Constants.MAX_PLAYER_HP)
      : (this.hp += recover);
  }

  // プレイヤーが死んでいるかどうかを返します
  isDead(): boolean {
    return this.hp <= 0;
  }

  // 配置するボムの種類を変更する
  setBombType(t: Constants.BOMB_TYPES) {
    this.bombType = t;
  }

  // ボムの種類を取得する
  getBombType(): Constants.BOMB_TYPES {
    return this.bombType;
  }

  // 爆弾の破壊力を取得する
  getBombStrength(): number {
    return this.bombStrength;
  }

  // ボムの火力を変更する
  setBombStrength(bombStrength: number) {
    this.bombStrength =
      bombStrength > Constants.MAX_BOMB_STRENGTH ? Constants.MAX_BOMB_STRENGTH : bombStrength;
  }

  // 速さを取得する
  getSpeed(): number {
    return this.speed;
  }

  // 速さを変更する
  setSpeed(speed: number) {
    this.speed = speed > Constants.MAX_PLAYER_SPEED ? Constants.MAX_PLAYER_SPEED : speed;
  }

  // ボムを設置できるかをチェックする
  canSetBomb(): boolean {
    return this.maxBombCount - this.currentSetBombCount > 0;
  }

  // ボムを設置しているかをチェックする
  isSetBomb(): boolean {
    return this.currentSetBombCount > 0;
  }

  // 今設置しているボムの個数を増やす
  increaseSetBombCount() {
    if (this.canSetBomb()) this.currentSetBombCount++;
  }

  // 今設置しているボムの個数を減らす
  decreaseSetBombCount() {
    this.currentSetBombCount--;
    if (this.currentSetBombCount < 0) this.currentSetBombCount = 0;
  }

  // ボムの最大数を増やす
  increaseMaxBombCount(count = 1) {
    if (this.maxBombCount + count > Constants.MAX_SETTABLE_BOMB_COUNT) {
      this.maxBombCount = Constants.MAX_SETTABLE_BOMB_COUNT;
    } else {
      this.maxBombCount += count;
    }
  }

  setIsWaiting() {
    this.gameState = Constants.PLAYER_GAME_STATE.WAITING;
  }

  setIsReady() {
    this.gameState = Constants.PLAYER_GAME_STATE.READY;
  }

  setIsLoadingComplete() {
    this.gameState = Constants.PLAYER_GAME_STATE.LOADING_COMPLETE;
  }

  isWaiting() {
    return this.gameState === Constants.PLAYER_GAME_STATE.WAITING;
  }

  isReady() {
    return this.gameState === Constants.PLAYER_GAME_STATE.READY;
  }

  isLoadingComplete() {
    return this.gameState === Constants.PLAYER_GAME_STATE.LOADING_COMPLETE;
  }

  setPlayerName(playerName: string) {
    this.name = playerName;
  }

  // アイテムを取得した数を記録する
  incrementItem(itemType: Constants.ITEM_TYPES) {
    const count = this.getItemMap.get(itemType);

    if (count === undefined) {
      this.getItemMap.set(itemType, 1);
    } else {
      this.getItemMap.set(itemType, count + 1);
    }
  }

  // アイテムを取得合計数を取得する
  getItemMapTotalCount(): number {
    let count = 0;
    this.getItemMap.forEach((value, key) => {
      count += value;
    });
    return count;
  }

  // プレイヤーのマス目の位置を取得する
  getTilePosition(): { x: number; y: number } {
    return PixelToTile(this.x, this.y);
  }

  // プレイヤーのステータスを最強にする
  debugSetPlayerStatusMax() {
    if (!IS_BACKEND_DEBUG) return;
    this.hp = Constants.MAX_PLAYER_HP;
    this.speed = Constants.MAX_PLAYER_SPEED;
    this.maxBombCount = Constants.MAX_SETTABLE_BOMB_COUNT;
    this.bombStrength = Constants.MAX_BOMB_STRENGTH;
  }
}
