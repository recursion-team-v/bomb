import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload() {
    // load sprite sheet
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('bomb', 'assets/bomb.png', {
      frameWidth: 32,
      frameHeight: 16,
      endFrame: 12,
    });
    this.load.spritesheet('explosion', 'assets/explosion.png', {
      frameWidth: 48,
      frameHeight: 48,
      startFrame:0,
      endFrame:20
    });
    this.load.spritesheet('tip_explosion', 'assets/tipExplosion.png', {
      frameWidth: 48,
      frameHeight: 48,
      startFrame:0,
      endFrame:20
    });
    console.log('preloader: sprites loaded');
  }

  create() {
    this.scene.start('game');
    console.log('preloader: start game');
  }
}
