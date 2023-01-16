import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import MyPlayer from '../characters/MyPlayer';
import * as Config from '../config/config';
import ToString from '../utils/color';
import { getGameScene } from '../utils/globalGame';
import { isMute, toggle } from '../utils/sound';
import convertSecondsToMMSS from '../utils/timer';
import Network from '../services/Network';

export default class GameHeader extends Phaser.Scene {
  private readonly width: number;
  private readonly height: number;

  private textTimer!: Phaser.GameObjects.Text;
  private remainTime: number = 0;
  private player!: MyPlayer;
  private textBombCount!: Phaser.GameObjects.Text;
  private textBombStrength!: Phaser.GameObjects.Text;
  private textSpeed!: Phaser.GameObjects.Text;
  private iconVolume!: Phaser.GameObjects.Image;
  private network!: Network;

  constructor() {
    super(Config.SCENE_NAME_GAME_HEADER);

    this.height = Constants.HEADER_HEIGHT;
    this.width = Constants.HEADER_WIDTH;
  }

  init() {
    this.cameras.main.setSize(this.width, this.height);
    this.cameras.main.setBackgroundColor(ToString(Constants.HEADER_COLOR_CODE));

    this.player = getGameScene().getCurrentPlayer();

    this.textTimer = this.createText(0, 0, '');
    this.textBombCount = this.createText(200, 0, `×${this.player.getItemCountOfBombCount()}`);
    this.textBombStrength = this.createText(350, 0, `×${this.player.getItemCountOfBombStrength()}`);
    this.textSpeed = this.createText(500, 0, `×${this.player.getItemCountOfSpeed()}`);

    // 特に意味はないが Container でまとめておく
    this.add.container(0, 0, [
      this.add.image(150, 10, Constants.ITEM_TYPE.BOMB_POSSESSION_UP).setScale(0.5).setOrigin(0, 0),
      this.textBombCount,
      this.add.image(300, 10, Constants.ITEM_TYPE.BOMB_STRENGTH).setScale(0.5).setOrigin(0, 0),
      this.textBombStrength,
      this.add.image(450, 10, Constants.ITEM_TYPE.PLAYER_SPEED).setScale(0.5).setOrigin(0, 0),
      this.textSpeed,
    ]);

    this.iconVolume = this.add
      .image(
        this.width - 60,
        10,
        Config.SOUND_DEFAULT_IS_PLAY ? Config.ASSET_KEY_VOLUME_ON : Config.ASSET_KEY_VOLUME_OFF
      )
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', () => this.updateVolumeIcon());
  }

  create(data: { network: Network }) {
    if (data.network == null) return;
    this.network = data.network;
  }

  update() {
    if (this.network.getGameFinishedAt() === undefined) {
      this.network.sendRequestGameStartInfo();
    }
    this.updateTextTimer(this.network.getGameFinishedAt() - this.network.now());
    this.textBombCount.setText(`×${this.player.getItemCountOfBombCount()}`);
    this.textBombStrength.setText(`×${this.player.getItemCountOfBombStrength()}`);
    this.textSpeed.setText(`×${this.player.getItemCountOfSpeed()}`);
  }

  updateTextTimer(timeLimit: number) {
    this.remainTime = timeLimit / 1000;
    this.textTimer.setText(convertSecondsToMMSS(this.remainTime));
  }

  createText(x: number, y: number, text: string, fontSize = 32): Phaser.GameObjects.Text {
    const paddingHeight = (this.height - fontSize) / 2;
    return this.add
      .text(x, y, text, { fontSize: `${fontSize}px` })
      .setColor(ToString(Constants.HEADER_TIMER_TEXT_COLOR_CODE))
      .setPadding(10, paddingHeight, 10, paddingHeight);
  }

  private volumeIcon(): string {
    return isMute() ? Config.ASSET_KEY_VOLUME_ON : Config.ASSET_KEY_VOLUME_OFF;
  }

  private updateVolumeIcon() {
    toggle();
    this.iconVolume.setTexture(this.volumeIcon());
  }
}
