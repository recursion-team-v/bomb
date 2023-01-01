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

  // 指定の座標から設置可能な座標を返します
  static getSettablePosition(x: number, y: number): { x: number; y: number } {
    const bx =
      Math.floor(x / Constants.TILE_WIDTH) * Constants.TILE_WIDTH + Constants.TILE_WIDTH / 2;
    const by =
      Math.floor(y / Constants.TILE_HEIGHT) * Constants.TILE_HEIGHT + Constants.TILE_HEIGHT / 2;

    return { x: bx, y: by };
  }

  explode() {
    const addExplodeSprite = (
      bx: number,
      by: number,
      playKey: string,
      angle: number = 0,
      scale: number = 1
    ) => {
      this.scene.add
        .blast(bx, by, playKey, this.bombStrength)
        .setScale(scale, scale)
        .setAngle(angle)
        .play(playKey)
        .setSensor(true);
    };

    addExplodeSprite(this.x, this.y, 'bomb_center_explosion');

    if (this.bombStrength > 1) {
      for (let i = 1; i < this.bombStrength; i++) {
        addExplodeSprite(this.x + IngameConfig.tileWidth * i, this.y, 'bomb_horizontal_explosion');
        addExplodeSprite(
          this.x,
          this.y + IngameConfig.tileWidth * i,
          'bomb_horizontal_explosion',
          90
        );
        addExplodeSprite(
          this.x - IngameConfig.tileWidth * i,
          this.y,
          'bomb_horizontal_explosion',
          180
        );
        addExplodeSprite(
          this.x,
          this.y - IngameConfig.tileWidth * i,
          'bomb_horizontal_explosion',
          270
        );
      }
    }

    // add horizontal end explosions
    addExplodeSprite(
      this.x + IngameConfig.tileWidth * this.bombStrength,
      this.y,
      'bomb_horizontal_end_explosion'
    );
    addExplodeSprite(
      this.x,
      this.y + IngameConfig.tileWidth * this.bombStrength,
      'bomb_horizontal_end_explosion',
      90
    );
    addExplodeSprite(
      this.x - IngameConfig.tileWidth * this.bombStrength,
      this.y,
      'bomb_horizontal_end_explosion',
      180
    );
    addExplodeSprite(
      this.x,
      this.y - IngameConfig.tileWidth * this.bombStrength,
      'bomb_horizontal_end_explosion',
      270
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
    bombStrength: number
  ) {
    super(world, x, y, texture);
    this.bombStrength = bombStrength;

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.EXPLOSION;

    this.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
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
    bombStrength = 1
  ) {
    const sprite = new Blast(this.scene.matter.world, x, y, texture, bombStrength);

    this.displayList.add(sprite);
    this.updateList.add(sprite);
    sprite.playAnim();
    return sprite;
  }
);
