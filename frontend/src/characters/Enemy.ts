import Phaser from 'phaser';
import Player from './Player';

export default class Enemy extends Player {
  update(playerX: number, playerY: number) {
    this.move(playerX, playerY);
  }

  move(playerX: number, playerY: number) {
    let vx;
    let vy = 0; // velocity x, velocity y

    this.x < playerX ? (vx = this.speed) : (vx = -this.speed);
    this.y < playerY ? (vy = this.speed) : (vy = -this.speed);
    this.setVelocity(vx, vy);

    if (vx > 0) this.play('player_right', true);
    else if (vx < 0) this.play('player_left', true);
    else if (vy > 0) this.play('player_down', true);
    else if (vy < 0) this.play('player_up', true);
    else this.stop();
  }
}

// register enemy to GameObjectFactory
// ゲームシーンの中で使用できるようにする
Phaser.GameObjects.GameObjectFactory.register(
  'enemy',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const sprite = new Enemy(this.scene.matter.world, x, y, texture, frame, options);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    sprite.setScale(2, 2);
    sprite.setPlayerColor(Math.random() * 0xffffff);

    return sprite;
  }
);
