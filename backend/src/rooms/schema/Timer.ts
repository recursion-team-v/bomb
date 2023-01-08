import { Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';

export default class Timer extends Schema {
  // 開始時間
  @type('number')
  private startedAt!: number;

  // 終了時間
  @type('number')
  private finishedAt!: number;

  // 残り時間
  @type('number')
  private remainTime!: number;

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

  // 残り時間をセットする
  setRemainTime() {
    this.remainTime = this.isInTime() ? this.finishedAt - this.now : 0;
  }

  getRemainTime() {
    return this.remainTime;
  }

  // 制限時間内かどうかを返す
  isInTime(): boolean {
    return this.now < this.finishedAt;
  }
}
