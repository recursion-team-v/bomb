import IngameConfig from './ingameConfig';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ScreenConfig {
  static headerHeight: number = 60;
  static headerColorCode: string = '#000000';
  static headerTimerTextColorCode: string = '#FFFFFF';

  static height: number = IngameConfig.tileRows * IngameConfig.tileHeight + this.headerHeight;
  static width: number = IngameConfig.tileCols * IngameConfig.tileWidth;

  static headerWidth: number = ScreenConfig.width;
}
