import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';
import isMobile from '../utils/mobile';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super(Config.SCENE_NAME_PRELOADER);
  }

  preload() {
    // load sprite sheet

    const frameWidth = Constants.DEFAULT_TIP_SIZE;
    const frameHeight = Constants.DEFAULT_TIP_SIZE;

    this.load.spritesheet('player', 'assets/player.png', { frameWidth, frameHeight });
    this.load.spritesheet('bomb', 'assets/items/bomb/bomb.png', {
      frameWidth,
      frameHeight,
    });
    this.load.spritesheet('bomb_center_explosion', 'assets/items/bomb/center_explosion.png', {
      frameWidth,
      frameHeight,
    });
    this.load.spritesheet(
      'bomb_horizontal_explosion',
      'assets/items/bomb/horizontal_explosion.png',
      {
        frameWidth,
        frameHeight,
      }
    );
    this.load.spritesheet(
      'bomb_horizontal_end_explosion',
      'assets/items/bomb/horizontal_end_explosion.png',
      {
        frameWidth,
        frameHeight,
      }
    );
    this.load.image('tile_grounds', 'assets/tile_grounds.png');
    this.load.image('tile_walls', 'assets/tile_walls.png');

    this.load.spritesheet(Constants.OBJECT_LABEL.WALL, 'assets/tile_walls.png', {
      frameWidth,
      frameHeight,
    });
    this.load.image(Constants.ITEM_TYPE.BOMB_POSSESSION_UP, 'assets/items/item_bomb_up.png');
    this.load.image(Constants.ITEM_TYPE.BOMB_STRENGTH, 'assets/items/item_bomb_strength.png');
    this.load.image(Constants.ITEM_TYPE.PLAYER_SPEED, 'assets/items/item_player_speed.png');

    if (isMobile()) {
      this.load.image(Constants.JOYSTICK_BASE_KEY, 'assets/joystick-base.png');
      this.load.image(Constants.JOYSTICK_STICK_KEY, 'assets/joystick-red.png');
    }
    console.log('preloader: sprites loaded');
  }

  create() {
    this.scene.start(Config.SCENE_NAME_GAME);
    this.scene.start(Config.SCENE_NAME_GAME_HEADER);
    console.log('preloader: start game');
  }
}
