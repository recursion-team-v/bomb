import Phaser from 'phaser';
import IngameConfig from '../config/ingameConfig';
import { ItemTypes } from '../types/items';

import * as Constants from '../../../constants/constants';
import Server from '../core/server';

export default class Preloader extends Phaser.Scene {
  private server!: Server;

  constructor() {
    super('preloader');
  }

  preload() {
    // load sprite sheet

    const frameWidth = IngameConfig.defaultTipSize;
    const frameHeight = IngameConfig.defaultTipSize;

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

    this.load.spritesheet(IngameConfig.keyInnerWall, 'assets/tile_walls.png', {
      frameWidth,
      frameHeight,
    });
    this.load.image(ItemTypes.BOMB_STRENGTH, 'assets/items/item_bomb_strength.png');
    this.load.image(ItemTypes.PLAYER_SPEED, 'assets/items/item_player_speed.png');
    console.log('preloader: sprites loaded');
  }

  init() {
    this.server = new Server();
    this.server.join().catch((err) => {
      console.error(err);
    });
  }

  async create() {
    this.server.send(Constants.NOTIFICATION_TYPE.GAME_PROGRESS, {});
    this.scene.start('game', { server: this.server });
    this.scene.start('gameHeader');
    console.log('preloader: start game');
  }
}
