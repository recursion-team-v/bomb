import Phaser from 'phaser';
import { createPlayerAnims } from '../anims/PlayerAnims';

export default class Game extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('game');
  }

  preload() {
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    createPlayerAnims(this.anims);

    const collisionScale = [0.8, 0.8];
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.tint = Math.random() * 0xffffff;
    this.player.setScale(2, 2);
    this.player.body.setSize(
      this.player.width * collisionScale[0],
      this.player.height * collisionScale[1]
    );
    this.player.setCollideWorldBounds(true);
  }

  update() {
    if (this.cursors == null || this.player == null) return;
    if (this.cursors.left.isDown) {
      this.player.setVelocity(-160, 0);
      this.player.anims.play('player_left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocity(160, 0);
      this.player.anims.play('player_right', true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocity(0, -160);
      this.player.anims.play('player_up', true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocity(0, 160);
      this.player.anims.play('player_down', true);
    } else {
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
    }
  }
}
