import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';
import convertSecondsToMMSS from '../utils/timer';

export default class GameHeader extends Phaser.Scene {
  private readonly width: number;
  private readonly height: number;
  private readonly headerColorCode: string;
  private readonly headerTimerTextColorCode: string;

  private timerText!: Phaser.GameObjects.Text;
  private remainTime: number = 0;

  constructor() {
    super(Config.SCENE_NAME_GAME_HEADER);

    this.height = Constants.HEADER_HEIGHT;
    this.width = Constants.HEADER_WIDTH;
    this.headerColorCode = Constants.HEADER_COLOR_CODE.toString(16);
    this.headerTimerTextColorCode = Constants.HEADER_TIMER_TEXT_COLOR_CODE.toString(16);
  }

  init() {
    // Header の timer のテキスト
    const fontSize = 32;
    const paddingHeight = (this.height - fontSize) / 2;

    this.timerText = this.add
      .text(0, 0, '', { fontSize: `${fontSize}px` })
      .setColor(this.headerTimerTextColorCode)
      .setPadding(10, paddingHeight, 10, paddingHeight);

    this.cameras.main.setSize(this.width, this.height);
    this.cameras.main.setBackgroundColor(this.headerColorCode);
  }

  updateTimerText(timeLimit: number) {
    this.remainTime = timeLimit / 1000;
    this.timerText.setText(convertSecondsToMMSS(this.remainTime));
  }
}
