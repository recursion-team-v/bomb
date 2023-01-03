import { Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';

export default class Timer extends Schema {
  // 開始時間
  @type('number')
  private startedAt!: number;

  // 終了時間
  @type('number')
  private finishedAt!: number;

  // 制限時間をセットする
  set(epochtime: number) {
    this.startedAt = epochtime;

    // 終了時間は開始時間から制限時間を足したもの
    // js ではミリ秒単位で計算するので、1000倍している
    this.finishedAt = epochtime + Constants.TIME_LIMIT_SEC * 1000;
  }

  // 残り時間を返す
  remainTime(): number {
    return this.isInTime() ? this.finishedAt - Date.now() : 0;
  }

  // 制限時間内かどうかを返す
  isInTime(): boolean {
    return Date.now() < this.finishedAt;
  }
}
