import Phaser from 'phaser';

import ServerPlayer from '../../../backend/src/core/player';
import * as Constants from '../../../constants/constants';
import IngameConfig from '../config/ingameConfig';
import Server from '../core/server';
import { NavKeys } from '../types/keyboard';
import { ObjectTypes } from '../types/objects';
import { handleCollide } from '../utils/handleCollide';
import Player from './Player';

export default class MyPlayer extends Player {
  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, frame, options);

    // change hitbox size
    this.setScale(1, 1);
    this.setRectangle(IngameConfig.defaultTipSize, IngameConfig.defaultTipSize, {
      chamfer: 100,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
    });
    this.setOrigin(0.5, 0.5);
    this.setFixedRotation();
    this.setSpeed(5);
    this.play('player_down', true); // 最初は下向いてる

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.PLAYER;

    this.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
      const currBody = this.body as MatterJS.BodyType;
      data.bodyA.id === currBody.id
        ? handleCollide(data.bodyA, data.bodyB)
        : handleCollide(data.bodyB, data.bodyA);
    });
  }

  // player controller handler
  update(server: Server, cursors: NavKeys, sPlayer: ServerPlayer) {
    this.speed = sPlayer.speed;

    let vx = 0; // velocity x
    let vy = 0; // velocity y

    if (cursors.left.isDown || cursors.A.isDown) vx -= this.speed;
    if (cursors.right.isDown || cursors.D.isDown) vx += this.speed;
    if (cursors.up.isDown || cursors.W.isDown) vy -= this.speed;
    if (cursors.down.isDown || cursors.S.isDown) vy += this.speed;

    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(cursors.space);
    if (isSpaceJustDown) {
      this.placeBomb();
    }

    sPlayer.x = this.x + vx;
    sPlayer.y = this.y + vy;

    // TODO: 移動のたびに送るととんでもないので、FPSを考慮して送る
    server.send(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, {
      x: sPlayer.x,
      y: sPlayer.y,
      vx,
      vy,
    });

    this.setVelocity(vx, vy);

    if (vx > 0) this.play('player_right', true);
    else if (vx < 0) this.play('player_left', true);
    else if (vy > 0) this.play('player_down', true);
    else if (vy < 0) this.play('player_up', true);
    else this.stop();

    // if (vx === 0 && vy === 0) return;

    // this.setX(sPlayer.x);
    // this.setY(sPlayer.y);
  }

  placeBomb() {
    this.scene.add.bomb(this.x, this.y, this.bombStrength);
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

    return sprite;
  }
);
