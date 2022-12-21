import Phaser from 'phaser';
import Player from './Player';
import { NavKeys } from '../types/keyboard';

export default class MyPlayer extends Player {
  private readonly myPlayerContainerBody?: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    this.myPlayerContainerBody = this.playerContainer?.body as Phaser.Physics.Arcade.Body;
  }

  // randomly change player color
  changePlayerColor() {
    this.tint = Math.random() * 0xffffff;
  }

  // player controller handler
  update(cursors: NavKeys) {
    let vx = 0; // velocity x
    let vy = 0; // velocity y

    if (cursors.left.isDown || cursors.A.isDown) vx -= this.speed;
    if (cursors.right.isDown || cursors.D.isDown) vx += this.speed;
    if (cursors.up.isDown || cursors.W.isDown) vy -= this.speed;
    if (cursors.down.isDown || cursors.S.isDown) vy += this.speed;
    this.setVelocity(vx, vy);
    this.body.velocity.setLength(this.speed);

    this.myPlayerContainerBody?.setVelocity(vx, vy);
    this.myPlayerContainerBody?.velocity.setLength(this.speed);

    if (vx > 0) this.play('player_right', true);
    else if (vx < 0) this.play('player_left', true);
    else if (vy > 0) this.play('player_down', true);
    else if (vy < 0) this.play('player_up', true);
    else this.stop();
  }
}

// declare myPlayer type in GameObjectFactory
declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer: (x: number, y: number, texture: string) => MyPlayer;
    }
  }
}

// register myPlayer to GameObjectFactory
// can call this.add.myPlayer() in scene
Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string) {
    const sprite = new MyPlayer(this.scene, x, y, texture);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY);

    sprite.setPlayerName(`player: ${Phaser.Math.Between(1, 8)}`);
    sprite.setScale(2, 2);
    sprite.changePlayerColor();

    sprite.body
      .setSize(sprite.width * sprite.collisionScale[0], sprite.height * sprite.collisionScale[1])
      .setOffset(
        sprite.width * (1 - sprite.collisionScale[0]) * 0.5,
        sprite.height * (1 - sprite.collisionScale[1])
      );

    return sprite;
  }
);
