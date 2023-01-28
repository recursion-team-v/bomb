import * as Constants from '../../../backend/src/constants/constants';
import { getDepth } from './util';

export class Block extends Phaser.Physics.Matter.Sprite {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number) {
    super(world, x, y, Constants.OBJECT_LABEL.BLOCK, 0, {
      isStatic: true,
    });

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.BLOCK;
    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS));
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'block',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
    const sprite = new Block(this.scene.matter.world, x, y);

    this.displayList.add(sprite);
    this.updateList.add(sprite);
    return sprite;
  }
);
