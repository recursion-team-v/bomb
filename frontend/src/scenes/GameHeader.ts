import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import convertSecondsToMMSS from '../utils/timer';

export default class GameHeader extends Phaser.Scene {
  private readonly width: number;
  private readonly height: number;
  private readonly headerColorCode: string;
  private readonly headerTimerTextColorCode: string;

  private timerText!: Phaser.GameObjects.Text;

  // private timerOneShot!: Phaser.Time.TimerEvent;
  private timerRepeat!: Phaser.Time.TimerEvent;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private timeLimitsSec: number; // ゲームの制限時間

  constructor() {
    super('gameHeader');

    this.height = Constants.HEADER_HEIGHT;
    this.width = Constants.HEADER_WIDTH;
    this.headerColorCode = Constants.HEADER_COLOR_CODE.toString(16);
    this.headerTimerTextColorCode = Constants.HEADER_TIMER_TEXT_COLOR_CODE.toString(16);
    this.timeLimitsSec = Constants.TIME_LIMIT_SEC;
  }

  init() {
    // Header の timer のテキスト
    const fontSize = 32;
    const paddingHeight = (this.height - fontSize) / 2;

    this.timerText = this.add
      .text(0, 0, '', { fontSize: `${fontSize}px` })
      .setColor(this.headerTimerTextColorCode)
      .setPadding(10, paddingHeight, 10, paddingHeight);
  }

  create() {
    this.cameras.main.setSize(this.width, this.height);
    this.cameras.main.setBackgroundColor(this.headerColorCode);

    this.timerRepeat = this.time.addEvent({
      delay: 1000 * this.timeLimitsSec,
      repeat: 0,
    });
  }

  update() {
    const formatRemainTime: string = convertSecondsToMMSS(this.timerRepeat.getRemainingSeconds());
    this.timerText.setText(formatRemainTime);

    if (this.timerRepeat.getRemainingSeconds() <= 0) {
      this.scene.stop('gameHeader');
      this.scene.stop('game');
      this.scene.start('gameResult');
    }
  }
}
