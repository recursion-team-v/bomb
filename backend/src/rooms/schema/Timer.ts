import { Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';

export default class Timer extends Schema {
  // 開始時間
  @type('number')
  startedAt!: number;

  // 終了時間
  @type('number')
  finishedAt!: number;

  // 現在時刻
  @type('number')
  private now!: number;

  // 制限時間をセットする
  set(epochtime: number) {
    this.startedAt = epochtime;

    // 終了時間は開始時間から制限時間を足したもの
    // js ではミリ秒単位で計算するので、1000倍している
    this.finishedAt = epochtime + Constants.TIME_LIMIT_SEC * 1000;

    this.now = Date.now();
  }

  updateNow() {
    this.now = Date.now();
  }

  getRemainTime() {
    return this.isInTime() ? this.finishedAt - this.now : 0;
  }

  // 制限時間内かどうかを返す
  isInTime(): boolean {
    return this.now < this.finishedAt;
  }

  // 制限時間を過ぎているかどうかを返す
  isFinished(): boolean {
    return this.now >= this.finishedAt;
  }

  // クライアントのオープニング演出が終わっているかどうかを返す
  isOpeningFinished(): boolean {
    // 600 ms 足しているのは、
    // オープニング直後に動き出すと明らかに人よりも CPU の動き出しが早く、ユーザが不公平感を感じるため
    const initialDelay = 600;
    return this.now >= this.startedAt + Constants.GAME_PREPARING_TIME * 1000 + initialDelay;
  }
}
