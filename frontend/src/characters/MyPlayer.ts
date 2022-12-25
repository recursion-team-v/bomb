import Phaser from 'phaser';
import Player from './Player';

import { NavKeys } from '../types/keyboard';
import Server from '../core/server';
import * as Constants from '../../../constants/constants';

export default class MyPlayer extends Player {
  // player controller handler
  update(server: Server, cursors: NavKeys, speed: number) {
    this.speed = speed;

    let vx = 0; // velocity x
    let vy = 0; // velocity y

    if (cursors.left.isDown || cursors.A.isDown) vx -= this.speed;
    if (cursors.right.isDown || cursors.D.isDown) vx += this.speed;
    if (cursors.up.isDown || cursors.W.isDown) vy -= this.speed;
    if (cursors.down.isDown || cursors.S.isDown) vy += this.speed;

    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(cursors.space);
    if (isSpaceJustDown) {
      this.setBomb();
    }
    this.setVelocity(vx, vy);

    if (vx > 0) this.play('player_right', true);
    else if (vx < 0) this.play('player_left', true);
    else if (vy > 0) this.play('player_down', true);
    else if (vy < 0) this.play('player_up', true);
    else this.stop();

    if (vx === 0 && vy === 0) return;

    const player = {
      x: this.x + vx,
      y: this.y + vy,
      speed: this.speed,
    };
    server.send(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, { Player: player });
  }

  setBomb() {
    this.scene.add.bomb(this.x, this.y, 'bomb');
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
