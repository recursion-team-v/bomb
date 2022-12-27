import Phaser from 'phaser';
import IngameConfig from '../config/ingameConfig';
import { ItemTypes } from '../types/items';

export default class Preloader extends Phaser.Scene {
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

    this.load.image(ItemTypes.BOMB_STRENGTH, 'assets/items/item_bomb_strength.png');
    this.load.image(ItemTypes.PLAYER_SPEED, 'assets/items/item_player_speed.png');
    console.log('preloader: sprites loaded');
  }

  create() {
    this.scene.start('game');
    this.scene.start('gameHeader');
    console.log('preloader: start game');
  }
}
