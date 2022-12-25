import Phaser from 'phaser';
import Config from '../config/config';
export default class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload() {
    // load sprite sheet
    const w = Config.playerWidth;
    const h = Config.playerHeight;

    this.load.spritesheet('player', 'assets/player.png', { frameWidth: w, frameHeight: h });
    this.load.spritesheet('enemy', 'assets/player.png', { frameWidth: w, frameHeight: h });
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
