import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import { createBombAnims } from '../anims/BombAnims';
import { createExplodeAnims } from '../anims/explodeAnims';
import { createPlayerAnims } from '../anims/PlayerAnims';
import * as Config from '../config/config';
import Network from '../services/Network';
import isMobile from '../utils/mobile';

export default class Preloader extends Phaser.Scene {
  private preloadComplete = false;
  network?: Network;

  constructor() {
    super(Config.SCENE_NAME_PRELOADER);
  }

  preload() {
    const frameWidth = Constants.DEFAULT_TIP_SIZE;
    const frameHeight = Constants.DEFAULT_TIP_SIZE;

    this.load.spritesheet('player', 'assets/player.png', { frameWidth, frameHeight });

    this.load.spritesheet('bomb', 'assets/items/bomb/bomb.png', {
      frameWidth,
      frameHeight,
    });

    this.load.spritesheet('bomb_center_blast', 'assets/items/bomb/center_blast.png', {
      frameWidth,
      frameHeight,
    });

    this.load.spritesheet('bomb_horizontal_blast', 'assets/items/bomb/horizontal_blast.png', {
      frameWidth,
      frameHeight,
    });

    this.load.spritesheet(
      'bomb_horizontal_end_blast',
      'assets/items/bomb/horizontal_end_blast.png',
      {
        frameWidth,
        frameHeight,
      }
    );

    // tile sheet for ground
    this.load.image('tile_grounds', 'assets/tile_grounds.png');

    // sprites for outer/inner wall
    this.load.spritesheet(Constants.OBJECT_LABEL.WALL, 'assets/tile_walls.png', {
      frameWidth,
      frameHeight,
    });

    // sprites for block
    this.load.spritesheet(Constants.OBJECT_LABEL.BLOCK, 'assets/tile_walls.png', {
      frameWidth,
      frameHeight,
    });

    // sprites for items
    this.load.image(Constants.ITEM_TYPE.BOMB_POSSESSION_UP, 'assets/items/item_bomb_up.png');
    this.load.image(Constants.ITEM_TYPE.BOMB_STRENGTH, 'assets/items/item_bomb_strength.png');
    this.load.image(Constants.ITEM_TYPE.PLAYER_SPEED, 'assets/items/item_player_speed.png');

    // icon
    this.load.image(Config.ASSET_KEY_VOLUME_ON, 'assets/icons/volume_on.png');
    this.load.image(Config.ASSET_KEY_VOLUME_OFF, 'assets/icons/volume_off.png');

    if (isMobile()) {
      this.load.image(Constants.JOYSTICK_BASE_KEY, 'assets/joystick-base.png');
      this.load.image(Constants.JOYSTICK_STICK_KEY, 'assets/joystick-red.png');
    }

    this.load.audio('bombExplode', ['assets/se/bomb.mp3']);
    this.load.audio('getItem', ['assets/se/get_item.mp3']);
    this.load.audio('gameOver', ['assets/se/game_over.mp3']);
    this.load.audio('hitPlayer', ['assets/se/hit_player.mp3']);
    this.load.audio('stage_1', ['assets/bgm/stage_1.mp3']);
    this.load.audio('stage_2', ['assets/bgm/stage_2.mp3']);

    this.load.on('complete', () => {
      // add player animations
      createPlayerAnims(this.anims);
      createBombAnims(this.anims);
      createExplodeAnims(this.anims);
      this.preloadComplete = true;
    });
  }

  init() {
    this.network = new Network();
  }

  update() {
    if (!this.preloadComplete) return;

    this.scene.start(Config.SCENE_NAME_LOBBY, {
      network: this.network,
    });
  }
}
