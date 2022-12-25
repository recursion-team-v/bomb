import Phaser from 'phaser';
import Player from './Player';
import { NavKeys } from '../types/keyboard';

export default class MyPlayer extends Player {
  // player controller handler
  update(cursors: NavKeys) {
    let vx = 0; // velocity x
    let vy = 0; // velocity y

    if (cursors.left.isDown || cursors.A.isDown) vx -= this.speed;
    if (cursors.right.isDown || cursors.D.isDown) vx += this.speed;
    if (cursors.up.isDown || cursors.W.isDown) vy -= this.speed;
    if (cursors.down.isDown || cursors.S.isDown) vy += this.speed;
    this.setVelocity(vx, vy);

    if (vx > 0) this.play('player_right', true);
    else if (vx < 0) this.play('player_left', true);
    else if (vy > 0) this.play('player_down', true);
    else if (vy < 0) this.play('player_up', true);
    else this.stop();
  }
}

// register myPlayer to GameObjectFactory
// ゲームシーンの中で this.add.myPlayer() と呼べる様にする
Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const sprite = new MyPlayer(this.scene.matter.world, x, y, texture, frame, options);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    // change hitbox size
    sprite.setScale(0.8, 1);
    sprite.setSpeed(5);
    sprite.setRectangle(64 * 0.6, 45, {
      chamfer: 40,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
    });
    sprite.setOrigin(0.5, 0.6);
    sprite.setFixedRotation();
    sprite.play('player_down', true); // 最初は下向いてる
    // sprite.setPlayerColor(Math.random() * 0xffffff);

    return sprite;
  }
);
