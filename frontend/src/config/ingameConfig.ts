// IngameConfig は ingame での設定をまとめたクラスです。

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class IngameConfig {
  static timeLimitsSec: number = 181; // ゲームの制限時間(+1秒するといい感じに表示される)

  static defaultTipSize: number = 64; // デフォルトのチップサイズ

  // マップの設定
  static tileRows = 13; // タイルの行数
  static tileCols = 15; // タイルの列数
  static tileWidth = this.defaultTipSize; // タイルの横幅
  static tileHeight = this.defaultTipSize; // タイルの縦幅

  static playerWith = this.defaultTipSize; // プレイヤーの横幅
  static playerHeight = this.defaultTipSize; // プレイヤーの縦幅
  static keyInnerWall = 'innerWall';

  static bombExplodedTime: number = 2500; // 爆弾の爆発するまでの時間(msec)
}
