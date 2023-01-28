import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import { getDepth } from './util';

export class InnerWall extends Phaser.Physics.Matter.Sprite {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, texture: string) {
    super(world, x, y, texture, 0);

    this.setScale(1, 0.9);
    const random = Phaser.Math.Between(0, 10);
    if (random < 5) this.setFlipX(true);

    this.setRectangle(Constants.TILE_WIDTH, Constants.TILE_HEIGHT, {
      isStatic: true,
      chamfer: {
        radius: Constants.TILE_WALL.INNER_CHAMFER,
      },
    });

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.WALL;
  }
}

export class OuterWall extends Phaser.Physics.Matter.Sprite {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, texture: string) {
    super(world, x, y, texture, 0, {
      isStatic: true,
    });

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.WALL;
    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS));
  }
}

export class DropWall extends Phaser.Physics.Matter.Sprite {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, frame: number) {
    super(world, x, y, Constants.OBJECT_LABEL.WALL, frame, {
      isStatic: true,
      isSensor: true,
    });

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.DROP_WALL;
    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS));
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'innerWall',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string) {
    const sprite = new InnerWall(this.scene.matter.world, x, y, texture);

    this.displayList.add(sprite);
    this.updateList.add(sprite);
    return sprite;
  }
);

Phaser.GameObjects.GameObjectFactory.register(
  'outerWall',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string) {
    const sprite = new OuterWall(this.scene.matter.world, x, y, texture);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);

Phaser.GameObjects.GameObjectFactory.register(
  'dropWall',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, frame: number) {
    const sprite = new DropWall(this.scene.matter.world, x, y, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
