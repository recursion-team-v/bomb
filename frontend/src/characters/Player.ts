import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import IngameConfig from '../config/ingameConfig';
import { handleCollide } from '../utils/handleCollide';

export default class Player extends Phaser.Physics.Matter.Sprite {
  public speed: number;
  public bombStrength: number;
  public settableBombCount: number;

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, frame, options);

    this.speed = Constants.INITIAL_PLAYER_SPEED;
    this.bombStrength = Constants.INITIAL_BOMB_STRENGTH;
    this.settableBombCount = Constants.INITIAL_SETTABLE_BOMB_COUNT;

    this.setScale(1, 1);
    this.setRectangle(IngameConfig.defaultTipSize, IngameConfig.defaultTipSize, {
      chamfer: 0,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
    });
    this.setOrigin(0.5, 0.5);
    this.setFixedRotation();
    this.setSpeed(this.speed);
    this.play('player_down', true); // 最初は下向いてる

    this.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
      const currBody = this.body as MatterJS.BodyType;
      data.bodyA.id === currBody.id
        ? handleCollide(data.bodyA, data.bodyB)
        : handleCollide(data.bodyB, data.bodyA);
    });
  }

  // set player speed
  setSpeed(speed: number) {
    this.speed = speed;
  }

  // set player bomb strength
  setBombStrength(bombStrength: number) {
    this.bombStrength = bombStrength;
  }

  // set Player color
  setPlayerColor(color: number) {
    this.tint = color;
  }

  // ボムを置ける数を増やす
  increaseSettableBombCount() {
    if (this.settableBombCount < Constants.MAX_SETTABLE_BOMB_COUNT) this.settableBombCount++;
  }

  // ボムを置ける数を減らす
  decreaseSettableBombCount() {
    if (this.settableBombCount > Constants.INITIAL_SETTABLE_BOMB_COUNT) this.settableBombCount--;
  }

  // ボムを置く
  placeBomb() {
    if (this.settableBombCount === 0) return;
    const bx =
      Math.floor(this.x / IngameConfig.tileWidth) * IngameConfig.tileWidth +
      IngameConfig.tileWidth / 2;
    const by =
      Math.floor(this.y / IngameConfig.tileHeight) * IngameConfig.tileHeight +
      IngameConfig.tileHeight / 2;

    this.scene.add.bomb(bx, by, this.bombStrength, this);
    this.settableBombCount--;
  }

  gameOver() {
    // this.destroy();
  }
}
