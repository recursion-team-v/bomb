import Phaser from 'phaser';
import IngameConfig from '../config/ingameConfig';
import { ObjectTypes } from '../types/object';

export default class Bomb extends Phaser.Physics.Matter.Sprite {
  private readonly bombStrength: number;

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    bombStrength: number
  ) {
    super(world, x, y, texture);

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.BOMB;

    this.bombStrength = bombStrength;
  }

  explode() {
    this.scene.add.blast(this.x, this.y, this.bombStrength);
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'bomb',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, bombStrength = 1) {
    const sprite = new Bomb(this.scene.matter.world, x, y, 'bomb', bombStrength);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    sprite.setStatic(true);

    sprite.play('bomb_count', false);
    // bomb_count アニメーションが終わったら explode
    sprite.once('animationcomplete', () => {
      sprite.explode();
      sprite.destroy();
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
  }

  draw() {
    const group = this.world.scene.add.group();
    const addExplodeSprite = (
      group: Phaser.GameObjects.Group,
      bx: number,
      by: number,
      playkey: string,
      angle: number = 0,
      scale: number = 1
    ) => {
      group.add(
        this.scene.matter.add
          .sprite(bx, by, playkey)
          .setScale(scale, scale)
          .setAngle(angle)
          .play(playkey)
          .setSensor(true)
      );
    };


    // add horizontal explosions
    if (this.bombStrength > 1) {
      for (let i = 1; i < this.bombStrength; i++) {
        addExplodeSprite(
          group,
          this.x + IngameConfig.tileWidth * i,
          this.y,
          'bomb_horizontal_explosion'
        );
        addExplodeSprite(
          group,
          this.x,
          this.y + IngameConfig.tileWidth * i,
          'bomb_horizontal_explosion',
          90
        );
        addExplodeSprite(
          group,
          this.x - IngameConfig.tileWidth * i,
          this.y,
          'bomb_horizontal_explosion',
          180
        );
        addExplodeSprite(
          group,
          this.x,
          this.y - IngameConfig.tileWidth * i,
          'bomb_horizontal_explosion',
          270
        );
      }
    }

    // add horizontal end explosions
    addExplodeSprite(
      group,
      this.x + IngameConfig.tileWidth * this.bombStrength,
      this.y,
      'bomb_horizontal_end_explosion'
    );
    addExplodeSprite(
      group,
      this.x,
      this.y + IngameConfig.tileWidth * this.bombStrength,
      'bomb_horizontal_end_explosion',
      90
    );
    addExplodeSprite(
      group,
      this.x - IngameConfig.tileWidth * this.bombStrength,
      this.y,
      'bomb_horizontal_end_explosion',
      180
    );
    addExplodeSprite(
      group,
      this.x,
      this.y - IngameConfig.tileWidth * this.bombStrength,
      'bomb_horizontal_end_explosion',
      270
    );

    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        group.destroy(true);
        this.destroy();
      },
    });
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'blast',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, bombStrength = 1) {
    const sprite = new Blast(this.scene.matter.world, x, y, 'bomb_center_explosion', bombStrength);

    this.displayList.add(sprite);
    this.updateList.add(sprite);
    // add center explosion
    sprite.setScale(1.2, 1.2);
    sprite.setSensor(true);
    sprite.play('bomb_center_explosion');
    sprite.draw();
    return sprite;
  }
);
