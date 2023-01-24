import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import '../services/SoundVolume';
import MyPlayer from '../characters/MyPlayer';
import * as Config from '../config/config';
import ToString from '../utils/color';
import { getGameScene } from '../utils/globalGame';
import convertSecondsToMMSS from '../utils/timer';
import Network from '../services/Network';
import ServerTimer from '../../../backend/src/rooms/schema/Timer';
import { isPlay } from '../utils/sound';

export default class GameHeader extends Phaser.Scene {
  private readonly width: number;
  private readonly height: number;

  private serverTimer?: ServerTimer;
  private textTimer!: Phaser.GameObjects.Text;
  private remainTime: number = 0;
  private player!: MyPlayer;
  private textBombCount!: Phaser.GameObjects.Text;
  private textBombStrength!: Phaser.GameObjects.Text;
  private textSpeed!: Phaser.GameObjects.Text;
  private network!: Network;
  private imgBomb!: Phaser.GameObjects.Image;

  constructor() {
    super(Config.SCENE_NAME_GAME_HEADER);
    this.height = Constants.HEADER_HEIGHT;
    this.width = Constants.HEADER_WIDTH;
  }

  init() {
    this.cameras.main.setSize(this.width, this.height);

    this.player = getGameScene().getCurrentPlayer();

    this.textTimer = this.createText(0, 0, '');
    this.textBombCount = this.createText(250, 0, `×${this.player.getItemCountOfBombCount()}`);
    this.textBombStrength = this.createText(400, 0, `×${this.player.getItemCountOfBombStrength()}`);
    this.textSpeed = this.createText(550, 0, `×${this.player.getItemCountOfSpeed()}`);

    // 特に意味はないが Container でまとめておく
    this.imgBomb = this.add
      .image(200, 10, Constants.ITEM_TYPE.BOMB_POSSESSION_UP)
      .setScale(0.5)
      .setOrigin(0, 0);
    this.add.container(0, 0, [
      this.imgBomb,
      this.textBombCount,
      this.add.image(350, 10, Constants.ITEM_TYPE.BOMB_STRENGTH).setScale(0.5).setOrigin(0, 0),
      this.textBombStrength,
      this.add.image(500, 10, Constants.ITEM_TYPE.PLAYER_SPEED).setScale(0.5).setOrigin(0, 0),
      this.textSpeed,
    ]);

    this.add.volumeIcon(this, this.width - 60, 10, isPlay());
  }

  create(data: { network: Network; serverTimer: ServerTimer }) {
    const { network, serverTimer } = data;
    if (network == null) return;
    this.network = data.network;
    this.serverTimer = serverTimer;
  }

  update() {
    if (this.serverTimer === undefined) return;
    this.updateTextTimer(this.serverTimer.finishedAt - this.network.now());

    if (this.player.getBombType() === Constants.BOMB_TYPE.PENETRATION) {
      this.imgBomb.setTexture(Constants.ITEM_TYPE.PENETRATION_BOMB);
    }
    this.textBombCount.setText(`×${this.player.getItemCountOfBombCount()}`);
    this.textBombStrength.setText(`×${this.player.getItemCountOfBombStrength()}`);
    this.textSpeed.setText(`×${this.player.getItemCountOfSpeed()}`);
  }

  updateTextTimer(timeLimit: number) {
    this.remainTime = timeLimit / 1000;
    this.textTimer.setText(convertSecondsToMMSS(this.remainTime));
  }

  createText(x: number, y: number, text: string, fontSize = 24): Phaser.GameObjects.Text {
    const paddingHeight = (this.height - fontSize) / 2;
    return this.add
      .text(x, y, text, { fontSize: `${fontSize}px` })
      .setFontFamily('PressStart2P')
      .setColor(ToString(Constants.HEADER_TIMER_TEXT_COLOR_CODE))
      .setPadding(10, paddingHeight, 10, paddingHeight);
  }
}
