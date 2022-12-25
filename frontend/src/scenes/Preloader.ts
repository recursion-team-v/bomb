import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload() {
    // load sprite sheet
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('bomb', 'assets/items/bomb/bomb.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('bomb_center_explosion', 'assets/items/bomb/center_explosion.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      'bomb_horizontal_explosion',
      'assets/items/bomb/horizontal_explosion.png',
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.spritesheet(
      'bomb_horizontal_end_explosion',
      'assets/items/bomb/horizontal_end_explosion.png',
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.image('tile_grounds', 'assets/tile_grounds.png');
    this.load.image('tile_walls', 'assets/tile_walls.png');
    console.log('preloader: sprites loaded');
  }

  create() {
    this.scene.start('game');
    this.scene.start('gameHeader');
    console.log('preloader: start game');
  }
}
