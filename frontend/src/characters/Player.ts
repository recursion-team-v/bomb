import Phaser from 'phaser';

import IngameConfig from '../config/ingameConfig';
import { handleCollide } from '../utils/handleCollide';

export default class Player extends Phaser.Physics.Matter.Sprite {
  public speed = 1;
  public bombStrength = 1;
  public havableBomb = 1;

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, frame, options);
    this.setScale(1, 1);
    this.setRectangle(IngameConfig.defaultTipSize, IngameConfig.defaultTipSize, {
      chamfer: 10,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
    });
    this.setOrigin(0.5, 0.5);
    this.setFixedRotation();
    this.setSpeed(1);
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

  increaseHavableBomb() {
    this.havableBomb++;
  }

  decreaseHavableBomb() {
    this.havableBomb--;
  }

  // ボムを置く
  placeBomb() {
    if (this.havableBomb === 0) return;
    const bx =
      Math.floor(this.x / IngameConfig.tileWidth) * IngameConfig.tileWidth +
      IngameConfig.tileWidth / 2;
    const by =
      Math.floor(this.y / IngameConfig.tileHeight) * IngameConfig.tileHeight +
      IngameConfig.tileHeight / 2;

    this.scene.add.bomb(bx, by, this.bombStrength,this);
    this.havableBomb--;
  }

  gameOver() {
    // this.destroy();
  }
}
