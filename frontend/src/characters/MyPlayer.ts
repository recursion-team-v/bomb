import Phaser from 'phaser';
import Player from './Player';
import { NavKeys } from '../types/keyboard';
import IngameConfig from '../config/ingameConfig';

export default class MyPlayer extends Player {
  private bombStrength = 1;

  // player controller handler
  update(cursors: NavKeys) {
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
    this.setVelocity(vx, vy);

    if (vx > 0) this.play('player_right', true);
    else if (vx < 0) this.play('player_left', true);
    else if (vy > 0) this.play('player_down', true);
    else if (vy < 0) this.play('player_up', true);
    else this.stop();
  }

  placeBomb() {
    this.scene.add.bomb(this.x, this.y, this.bombStrength);
  }

  getBombStrength() {
    return this.bombStrength;
  }

  setBombStrength(bombStrength: number) {
    this.bombStrength = bombStrength;
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
    sprite.setScale(1, 1);
    sprite.setRectangle(IngameConfig.defaultTipSize, IngameConfig.defaultTipSize, {
      chamfer: 100,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
    });
    sprite.setOrigin(0.5, 0.5);
    sprite.setFixedRotation();
    sprite.play('player_down', true); // 最初は下向いてる
    // sprite.setPlayerColor(Math.random() * 0xffffff);

    return sprite;
  }
);
