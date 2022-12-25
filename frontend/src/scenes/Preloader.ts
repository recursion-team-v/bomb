import Phaser from 'phaser';
import Server from '../server/server';
export default class Preloader extends Phaser.Scene {
  private server?: Server;

  constructor() {
    super('preloader');
  }

  preload() {
    // load sprite sheet
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('bomb', 'assets/bomb.png', {
      frameWidth: 48,
      frameHeight: 16,
      endFrame: 12,
    });
    this.load.spritesheet('explosion', 'assets/explosion.png', {
      frameWidth: 48,
      frameHeight: 48,
      startFrame: 0,
      endFrame: 20,
    });
    this.load.spritesheet('tip_explosion', 'assets/tipExplosion.png', {
      frameWidth: 48,
      frameHeight: 48,
      startFrame: 0,
      endFrame: 20,
    });
    this.load.image('tile_grounds', 'assets/tile_grounds.png');
    this.load.image('tile_walls', 'assets/tile_walls.png');
    console.log('preloader: sprites loaded');
  }

  init() {
    this.server = new Server();
  }

  async create() {
    this.scene.start('game');
    this.scene.start('gameHeader');
    console.log('preloader: start game');
    await this.server?.join();
  }
}
