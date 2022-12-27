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
    this.bombStrength = bombStrength;
  }

  explode(x: number, y: number) {
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
          .setData('objectType', ObjectTypes.EXPLOSION)
          .setSensor(true)
      );
    };

    // add center explosion
    addExplodeSprite(group, x, y, 'bomb_center_explosion', 0, 1.2);

    // add horizontal explosions
    if (this.bombStrength > 1) {
      for (let i = 1; i < this.bombStrength; i++) {
        addExplodeSprite(group, x + IngameConfig.tileWidth * i, y, 'bomb_horizontal_explosion');
        addExplodeSprite(group, x, y + IngameConfig.tileWidth * i, 'bomb_horizontal_explosion', 90);
        addExplodeSprite(group, x - IngameConfig.tileWidth * i, y, 'bomb_horizontal_explosion', 90);
        addExplodeSprite(
          group,
          x,
          y - IngameConfig.tileWidth * i,
          'bomb_horizontal_explosion',
          270
        );
      }
    }

    // add horizontal end explosions
    addExplodeSprite(
      group,
      x + IngameConfig.tileWidth * this.bombStrength,
      y,
      'bomb_horizontal_end_explosion'
    );
    addExplodeSprite(
      group,
      x,
      y + IngameConfig.tileWidth * this.bombStrength,
      'bomb_horizontal_end_explosion',
      90
    );
    addExplodeSprite(
      group,
      x - IngameConfig.tileWidth * this.bombStrength,
      y,
      'bomb_horizontal_end_explosion',
      180
    );
    addExplodeSprite(
      group,
      x,
      y - IngameConfig.tileWidth * this.bombStrength,
      'bomb_horizontal_end_explosion',
      270
    );

    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        group.destroy(true);
      },
    });
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
      sprite.explode(x, y);
      sprite.destroy();
    });

    return sprite;
  }
);
