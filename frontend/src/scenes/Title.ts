import * as Config from '../config/config';
import Network from '../services/Network';
import { addBackground, createLoginDialog } from '../utils/title';
import * as Constants from '../../../backend/src/constants/constants';
import '../services/SoundVolume';
import { validateAndFixUserName } from '../../../backend/src/utils/validation';
import { createBombUsage, createItemUsage, createMoveUsage, createTextBox } from '../utils/usage';
import { customCursor } from '../utils/key';

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
    addBackground(this);
    customCursor(this);

    const playGame = (userName: string) => {
      localStorage.setItem('username', userName);
      this.scene.start(Config.SCENE_NAME_LOBBY, {
        network: data.network,
        playerName: userName,
        bgm: this.bgm,
      });
      this.se?.play();
    };

    this.add.image(Constants.WIDTH / 2, Constants.HEIGHT / 2 - 150, 'title').setScale(1.5);

    this.add.volumeIcon(this, Constants.WIDTH - 60, 10);

    const username = localStorage.getItem('username');
    createLoginDialog(this, {
      x: Constants.WIDTH / 2,
      y: Constants.HEIGHT / 2,
      title: 'Input Your Name',
      username: username === null ? '' : username,
    }).on('playGame', function (userName: string) {
      playGame(validateAndFixUserName(userName));
    });
    // createUsageDialog(this, {
    //   x: Constants.WIDTH / 2,
    //   y: Constants.HEIGHT / 2 + 150,
    // });

    createTextBox(this, Constants.WIDTH / 2 - 650 / 2, Constants.HEIGHT / 2 + 120, {
      wrapWidth: 650,
      fixedWidth: 650,
      fixedHeight: 250,
    }).setOrigin(0.5);
    createBombUsage(this, Constants.WIDTH / 2 - 650 / 2 + 110, Constants.HEIGHT / 2 + 270);
    createMoveUsage(this, Constants.WIDTH / 2 - 650 / 2 + 320, Constants.HEIGHT / 2 + 220);
    createItemUsage(this, Constants.WIDTH / 2 - 650 / 2 + 460, Constants.HEIGHT / 2 + 200);
    this.add.text(0, 25, 'BGM: https://seadenden-8bit.com').setFontFamily('PressStart2P');
  }
}
