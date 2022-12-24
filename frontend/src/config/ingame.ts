// IngameConfig は ingame での設定をまとめたクラスです。
export default class IngameConfig {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private timeLimitsSec: number; // ゲームの制限時間

  constructor(timeLimitsSec = 180) {
    this.timeLimitsSec = timeLimitsSec;
  }

  public getTimeLimitsSec(): number {
    return this.timeLimitsSec;
  }
}
