import Phaser from 'phaser';
import Player from '../characters/Player';
import IngameConfig from '../config/ingameConfig';
import { ObjectTypes } from '../types/object';
import { handleCollide } from '../utils/handleCollide';

export default class Bomb extends Phaser.Physics.Matter.Sprite {
  private readonly bombStrength: number;

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

    this.bombStrength = bombStrength;
  }

  explode() {
    const addExplodeSprite = (
      bx: number,
      by: number,
      playkey: string,
      angle: number = 0,
      scale: number = 1
    ) => {
      this.scene.add
        .blast(bx, by, playkey, this.bombStrength)
        .setScale(scale, scale)
        .setAngle(angle)
        .play(playkey)
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
}

Phaser.GameObjects.GameObjectFactory.register(
  'bomb',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    bombStrength = 1,
    player: Player
  ) {
    const sprite = new Bomb(this.scene.matter.world, x, y, 'bomb', bombStrength, player);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    sprite.setStatic(true);
    sprite.play('bomb_count', false);

    // bomb_count アニメーションが終わったら explode
    sprite.once('animationcomplete', () => {
      sprite.explode();
      sprite.destroy();
      player.increaseHavableBomb();
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
    bombStrength = 1
  ) {
    const sprite = new Blast(this.scene.matter.world, x, y, texture, bombStrength);

    this.displayList.add(sprite);
    this.updateList.add(sprite);
    sprite.playAnim();
    return sprite;
  }
);
