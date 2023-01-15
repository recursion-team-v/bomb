import * as Config from '../config/config';
// import * as Constants from '../../../backend/src/constants/constants';
import Network from '../services/Network';
import { createLoginDialog } from '../utils/title';

export default class Title extends Phaser.Scene {
  private bgm?: Phaser.Sound.BaseSound;
  network?: Network;
  constructor() {
    super(Config.SCENE_NAME_TITLE);
  }

  init() {
    this.network = new Network();

    this.bgm = this.sound.add('opening', {
      volume: Config.SOUND_VOLUME,
    });

    this.bgm.play({
      loop: true,
    });
  }

  create() {
    const playGame = (userName: string) => {
      this.scene.start(Config.SCENE_NAME_GAME, {
        network: this.network
      });
      this.scene.start(Config.SCENE_NAME_GAME_HEADER, {
        network: this.network,
      });
      this.network?.sendPlayerName(userName);

    };

    this.add
      .image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 2 - 150, 'title')
      .setScale(1.5);

    createLoginDialog(this, {
      x: Number(this.game.config.width) / 2,
      y: Number(this.game.config.height) / 2,
      title: 'input user name',
      username: '',
    }).on('playGame', function (userName: string) {
      playGame(userName);
    });
  }
}
