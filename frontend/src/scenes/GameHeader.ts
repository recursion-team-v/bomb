import '../services/SoundVolume';

import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import ServerTimer from '../../../backend/src/rooms/schema/Timer';
import MyPlayer from '../characters/MyPlayer';
import * as Config from '../config/config';
import { Event, gameEvents } from '../events/GameEvents';
import Network from '../services/Network';
import ToString from '../utils/color';
import { getGameScene } from '../utils/globalGame';
import { isPlay } from '../utils/sound';
import convertSecondsToMMSS from '../utils/timer';

export default class GameHeader extends Phaser.Scene {
  private readonly width: number;
  private readonly height: number;

  private serverTimer?: ServerTimer;
  private textTimer!: Phaser.GameObjects.Text;
  private remainTime: number = 0;
  private player!: MyPlayer;
  private textHp!: Phaser.GameObjects.Text;
  private textBombCount!: Phaser.GameObjects.Text;
  private textBombStrength!: Phaser.GameObjects.Text;
  private textSpeed!: Phaser.GameObjects.Text;
  private network!: Network;
  private imgBomb!: Phaser.GameObjects.Image;
  private startTimer!: boolean;

  constructor() {
    super(Config.SCENE_NAME_GAME_HEADER);
    this.height = Constants.HEADER_HEIGHT;
    this.width = Constants.HEADER_WIDTH;
  }

  init() {
    this.cameras.main.setSize(this.width, this.height);
    this.player = getGameScene().getCurrentPlayer();

    this.startTimer = false;
    this.textTimer = this.createText(
      0,
      5,
      convertSecondsToMMSS(Constants.TIME_LIMIT_SEC - Constants.GAME_PREPARING_TIME - 1)
    );
    this.textHp = this.createText(150, 5, `HP:${this.player.getHP()}`);
    this.textBombCount = this.createText(350, 5, `×${this.player.getItemCountOfBombCount()}`);
    this.textBombStrength = this.createText(500, 5, `×${this.player.getItemCountOfBombStrength()}`);
    this.textSpeed = this.createText(650, 5, `×${this.player.getItemCountOfSpeed()}`);

    // 特に意味はないが Container でまとめておく
    this.imgBomb = this.add
      .image(300, 10, Constants.ITEM_TYPE.BOMB_POSSESSION_UP)
      .setScale(0.5)
      .setOrigin(0, 0);
    this.add
      .container(0, 0, [
        this.textHp,
        this.imgBomb,
        this.textBombCount,
        this.add.image(450, 10, Constants.ITEM_TYPE.BOMB_STRENGTH).setScale(0.5).setOrigin(0, 0),
        this.textBombStrength,
        this.add.image(600, 10, Constants.ITEM_TYPE.PLAYER_SPEED).setScale(0.5).setOrigin(0, 0),
        this.textSpeed,
      ])
      .setDepth(Infinity);

    this.add.volumeIcon(this, this.width - 100, -13, isPlay());
  }

  create(data: { network: Network; serverTimer: ServerTimer }) {
    const { network, serverTimer } = data;
    if (network == null) return;
    this.network = data.network;
    this.serverTimer = serverTimer;

    gameEvents.on(Event.GAME_PREPARING_COMPLETED, () => (this.startTimer = true));
  }

  update() {
    if (this.serverTimer === undefined) return;
    if (this.startTimer) {
      this.updateTextTimer(this.serverTimer.finishedAt - this.network.now());
    }
    if (this.player.getBombType() === Constants.BOMB_TYPE.PENETRATION) {
      this.imgBomb.setTexture(Constants.ITEM_TYPE.PENETRATION_BOMB);
    }

    this.textHp.setText(`HP:${this.player.getHP()}`);
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
