import IngameConfig from './ingameConfig';
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ScreenConfig {
  static headerHeight: number = 60;
  static headerColorCode: string = '#000000';
  static headerTimerTextColorCode: string = '#FFFFFF';

  static height: number = IngameConfig.tileCols * IngameConfig.tileHeight;
  static width: number = IngameConfig.tileRows * IngameConfig.tileWidth + this.headerHeight;

  static headerWidth: number = ScreenConfig.width;
}
