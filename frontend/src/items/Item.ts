import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import { getDepth } from './util';

export default class Item extends Phaser.Physics.Matter.Sprite {
  public readonly itemType: Constants.ITEM_TYPES;

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    itemType: Constants.ITEM_TYPES
  ) {
    super(world, x, y, itemType, undefined, {
      isSensor: true,
      isStatic: true,
    });

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.ITEM;

    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS));
    this.setScale(0.6);
    this.itemType = itemType;
  }

  removeItem() {
    this.destroy();
  }

  getType(): Constants.ITEM_TYPES {
    return this.itemType;
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'item',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    itemType: Constants.ITEM_TYPES
  ) {
    const sprite = new Item(this.scene.matter.world, x, y, itemType);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
