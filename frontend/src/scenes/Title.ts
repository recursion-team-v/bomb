import * as Config from '../config/config';
import Network from '../services/Network';
import { createLoginDialog } from '../utils/title';
import * as Constants from '../../../backend/src/constants/constants';
import '../services/SoundVolume';
import { validateAndFixUserName } from '../../../backend/src/utils/validation';
import { createBombUsage, createItemUsage, createMoveUsage, createTextBox } from '../utils/usage';

export default class Title extends Phaser.Scene {
  network?: Network;
  private bgm?: Phaser.Sound.BaseSound;
  private se?: Phaser.Sound.BaseSound;
  constructor() {
    super(Config.SCENE_NAME_TITLE);
  }

  init() {
    this.bgm = this.sound.add('opening', {
      volume: Config.SOUND_VOLUME,
    });
    this.se = this.sound.add('select', {
      volume: Config.SOUND_VOLUME,
    });

    this.bgm.play({
      loop: true,
    });
  }

  create(data: { network: Network }) {
    const playGame = (userName: string) => {
      this.scene.start(Config.SCENE_NAME_GAME, {
        network: data.network,
      });
      this.scene.start(Config.SCENE_NAME_GAME_HEADER, {
        network: data.network,
      });
      data.network?.sendPlayerName(userName);
      this.se?.play();
      this.bgm?.stop();
    };

    this.add
      .image(Number(this.game.config.width) / 2, Number(this.game.config.height) / 2 - 150, 'title')
      .setScale(1.5);

    this.add.volumeIcon(this, Constants.WIDTH - 60, 10);

    createLoginDialog(this, {
      x: Number(this.game.config.width) / 2,
      y: Number(this.game.config.height) / 2,
      title: 'input user name',
      username: '',
    }).on('playGame', function (userName: string) {
      playGame(validateAndFixUserName(userName));
    });
    // createUsageDialog(this, {
    //   x: Number(this.game.config.width) / 2,
    //   y: Number(this.game.config.height) / 2 + 150,
    // });

    createTextBox(
      this,
      Number(this.game.config.width) / 4-25,
      Number(this.game.config.height) / 2 + 100,
      {
        wrapWidth: 650,
        fixedWidth: 650,
        fixedHeight: 250,
      }
    );
    createBombUsage(
      this,
      Number(this.game.config.width) / 4+100,
      Number(this.game.config.height) / 2 + 250
    );
    createMoveUsage(
      this,
      Number(this.game.config.width) / 4 + 300,
      Number(this.game.config.height) / 2 + 200
    );
    createItemUsage(
      this,
      Number(this.game.config.width) / 4 + 420,
      Number(this.game.config.height) / 2 + 200
    );
  }
}
