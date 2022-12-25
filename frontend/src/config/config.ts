// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Config {
  /*
  スクリーン・マップ周りの設定
  */
  static defaultTipSize = 64; // デフォルトのチップサイズ

  // マップの設定
  static tileRows = 13; // タイルの行数
  static tileCols = 15; // タイルの列数
  static tileWidth = this.defaultTipSize; // タイルの横幅
  static tileHeight = this.defaultTipSize; // タイルの縦幅

  static playerWidth = this.defaultTipSize; // プレイヤーの横幅
  static playerHeight = this.defaultTipSize; // プレイヤーの縦幅

  static headerHeight: number = 60;
  static headerColorCode: string = '#000000';
  static headerTimerTextColorCode: string = '#FFFFFF';

  static height: number = this.tileCols * this.tileHeight;
  static width: number = this.tileRows * this.tileWidth + this.headerHeight;

  static headerWidth: number = this.width;

  static availableMapStartX = 0 + this.tileWidth; // マップの利用可能な領域の開始位置のX座標
  static availableMapStartY = this.headerHeight + this.tileHeight; // マップの利用可能な領域の開始位置のY座標
  static availableMapEndX = this.tileWidth * this.tileRows; // マップの利用可能な領域の終了位置のX座標
  static availableMapEndY = this.tileHeight * (this.tileCols - 2); // マップの利用可能な領域の終了位置のY座標

  static timeLimitsSec: number = 181; // ゲームの制限時間(+1秒するといい感じに表示される)

  /*
  ゲームの設定
  */

  // 衝突判定
  static playerCollisionCategory = 1;
  static otherPlayerCollisionCategory = 2;

  static playerCollidesWith = [1]; // プレイヤーが衝突するカテゴリ
}
