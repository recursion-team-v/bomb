import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';
import { ObjectTypes } from '../types/objects';

export class InnerWall extends Phaser.Physics.Matter.Sprite {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, frame: number) {
    super(world, x, y, ObjectTypes.WALL, frame, {
      chamfer: Constants.TILE_WALL.INNER_CHAMFER,
      isStatic: true,
    });

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.WALL;
  }
}

export class OuterWall extends Phaser.Physics.Matter.Sprite {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, frame: number) {
    super(world, x, y, ObjectTypes.WALL, frame, {
      isStatic: true,
    });

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.WALL;
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'innerWall',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, frame: number) {
    const sprite = new InnerWall(this.scene.matter.world, x, y, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);

Phaser.GameObjects.GameObjectFactory.register(
  'outerWall',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, frame: number) {
    const sprite = new OuterWall(this.scene.matter.world, x, y, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
