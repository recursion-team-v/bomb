import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import Player from '../characters/Player';
import { ObjectTypes } from '../types/object';
import { handleCollide } from '../utils/handleCollide';

export default class Bomb extends Phaser.Physics.Matter.Sprite {
  private readonly bombStrength: number;
  private readonly player: Player;

  // 誘爆時は状況によって爆弾が消えてしまい、座標やシーンが取得できなくなるため保存しておく
  private readonly stableX: number; // 爆弾が消えても座標を保持するための変数
  private readonly stableY: number; // 爆弾が消えても座標を保持するための変数
  private readonly stableScene: Phaser.Scene; // 爆弾が消えてもシーンを保持するための変数

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
    this.stableX = x;
    this.stableY = y;
    this.stableScene = this.scene;
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

      this.stableScene.add
        .blast(bx, by, playKey, this.bombStrength, rx, ry)
        .setScale(1, 1)
        .setAngle(angle)
        .play(playKey)
        .setSensor(true);
    };

    addExplodeSprite(this.stableX, this.stableY, 'bomb_center_explosion');

    if (this.bombStrength > 1) {
      for (let i = 1; i < this.bombStrength; i++) {
        addExplodeSprite(
          this.stableX + Constants.TILE_WIDTH * i,
          this.stableY,
          'bomb_horizontal_explosion'
        );
        addExplodeSprite(
          this.stableX,
          this.stableY + Constants.TILE_WIDTH * i,
          'bomb_horizontal_explosion',
          90,
          false,
          true
        );
        addExplodeSprite(
          this.stableX - Constants.TILE_WIDTH * i,
          this.stableY,
          'bomb_horizontal_explosion',
          180,
          false,
          true
        );
        addExplodeSprite(
          this.stableX,
          this.stableY - Constants.TILE_WIDTH * i,
          'bomb_horizontal_explosion',
          270,
          false,
          true
        );
      }
    }

    // 右
    addExplodeSprite(
      this.stableX + Constants.TILE_WIDTH * this.bombStrength,
      this.stableY,
      'bomb_horizontal_end_explosion',
      false,
      true
    );

    // 下
    addExplodeSprite(
      this.stableX,
      this.stableY + Constants.TILE_WIDTH * this.bombStrength,
      'bomb_horizontal_end_explosion',
      90,
      false,
      true
    );

    // 左
    addExplodeSprite(
      this.stableX - Constants.TILE_WIDTH * this.bombStrength,
      this.stableY,
      'bomb_horizontal_end_explosion',
      180,
      false,
      true
    );

    // 上
    addExplodeSprite(
      this.stableX,
      this.stableY - Constants.TILE_WIDTH * this.bombStrength,
      'bomb_horizontal_end_explosion',
      270,
      false,
      true
    );
  }

  updateCollision() {
    this.setSensor(false);

    const obj = this.setRectangle(
      Constants.TILE_WIDTH,
      Constants.TILE_HEIGHT
    ) as Phaser.Physics.Matter.Sprite;
    obj.setStatic(true);

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.BOMB;
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
      // console.log(data);
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
