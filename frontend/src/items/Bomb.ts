import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import Player from '../characters/Player';
import IngameConfig from '../config/ingameConfig';
import { ObjectTypes } from '../types/object';
import { handleCollide } from '../utils/handleCollide';

export default class Bomb extends Phaser.Physics.Matter.Sprite {
  private readonly bombStrength: number;
  private readonly player: Player;

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    bombStrength: number,
    player: Player
  ) {
    super(world, x, y, texture);

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.BOMB;

    this.player = player;
    this.bombStrength = bombStrength;
  }

  explode() {
    const addExplodeSprite = (
      bx: number,
      by: number,
      playKey: string,
      angle: number = 0,
      rectVertical: boolean = false,
      rectHorizontal: boolean = false
    ) => {
      const rx = rectVertical
        ? Constants.DEFAULT_TIP_SIZE * Constants.BOMB_COLLISION_RATIO
        : Constants.DEFAULT_TIP_SIZE;
      const ry = rectHorizontal
        ? Constants.DEFAULT_TIP_SIZE * Constants.BOMB_COLLISION_RATIO
        : Constants.DEFAULT_TIP_SIZE;

      this.scene.add
        .blast(bx, by, playKey, this.bombStrength, rx, ry)
        .setScale(1, 1)
        .setAngle(angle)
        .play(playKey)
        .setSensor(true);
    };

    addExplodeSprite(this.x, this.y, 'bomb_center_explosion', 0);

    if (this.bombStrength > 1) {
      for (let i = 1; i < this.bombStrength; i++) {
        addExplodeSprite(
          this.x + IngameConfig.tileWidth * i,
          this.y,
          'bomb_horizontal_explosion',
          0,
          false,
          true
        );
        addExplodeSprite(
          this.x,
          this.y + IngameConfig.tileWidth * i,
          'bomb_horizontal_explosion',
          90,
          false,
          true
        );
        addExplodeSprite(
          this.x - IngameConfig.tileWidth * i,
          this.y,
          'bomb_horizontal_explosion',
          180,
          false,
          true
        );
        addExplodeSprite(
          this.x,
          this.y - IngameConfig.tileWidth * i,
          'bomb_horizontal_explosion',
          270,
          false,
          true
        );
      }
    }

    // 右
    addExplodeSprite(
      this.x + IngameConfig.tileWidth * this.bombStrength,
      this.y,
      'bomb_horizontal_end_explosion',
      0,
      false,
      true
    );

    // 下
    addExplodeSprite(
      this.x,
      this.y + IngameConfig.tileWidth * this.bombStrength,
      'bomb_horizontal_end_explosion',
      90,
      false,
      true
    );

    // 左
    addExplodeSprite(
      this.x - IngameConfig.tileWidth * this.bombStrength,
      this.y,
      'bomb_horizontal_end_explosion',
      180,
      false,
      true
    );

    // 上
    addExplodeSprite(
      this.x,
      this.y - IngameConfig.tileWidth * this.bombStrength,
      'bomb_horizontal_end_explosion',
      270,
      false,
      true
    );
  }

  updateCollision() {
    this.setSensor(false);

    const obj = this.setRectangle(
      IngameConfig.tileWidth,
      IngameConfig.tileHeight
    ) as Phaser.Physics.Matter.Sprite;
    obj.setStatic(true);
  }

  // 引数の MatterJS.BodyType が爆弾の当たり判定と重なっているかどうかを返す
  isOverlapping(mp: Phaser.Physics.Matter.MatterPhysics, target: MatterJS.BodyType) {
    return mp.overlap(this.body as MatterJS.BodyType, [target]);
  }

  // ボムが爆発した後の処理
  afterExplosion() {
    this.destroy();
    this.player.recoverSettableBombCount();
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'bomb',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    bombStrength = Constants.INITIAL_BOMB_STRENGTH,
    player: Player
  ) {
    const sprite = new Bomb(this.scene.matter.world, x, y, 'bomb', bombStrength, player);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    sprite.setStatic(true);
    sprite.setSensor(true);
    sprite.play('bomb_count', false);

    // bomb_count アニメーションが終わったら explode
    sprite.once('animationcomplete', () => {
      sprite.explode();
      sprite.afterExplosion();
    });

    return sprite;
  }
);

export class Blast extends Phaser.Physics.Matter.Sprite {
  private readonly bombStrength: number;

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    bombStrength: number,
    rectangleX: number,
    rectangleY: number
  ) {
    super(world, x, y, texture);
    this.bombStrength = bombStrength;

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.EXPLOSION;

    console.log(rectangleX, rectangleY);
    this.setRectangle(rectangleX, rectangleY);
    this.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
      console.log(data);
      const currBody = this.body as MatterJS.BodyType;
      data.bodyA.id === currBody.id
        ? handleCollide(data.bodyA, data.bodyB)
        : handleCollide(data.bodyB, data.bodyA);
    });
  }

  playAnim() {
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.destroy();
      },
    });
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'blast',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    bombStrength = 1,
    rectangleX: number,
    rectangleY: number
  ) {
    const sprite = new Blast(
      this.scene.matter.world,
      x,
      y,
      texture,
      bombStrength,
      rectangleX,
      rectangleY
    );

    this.displayList.add(sprite);
    this.updateList.add(sprite);
    sprite.playAnim();
    return sprite;
  }
);
