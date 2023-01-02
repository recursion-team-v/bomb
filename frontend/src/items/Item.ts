import Phaser from 'phaser';
import { ObjectTypes } from '../types/objects';
import { ItemTypes } from '../types/items';

export default class Item extends Phaser.Physics.Matter.Sprite {
  public readonly itemType: ItemTypes;

  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, itemType: ItemTypes) {
    super(world, x, y, itemType, undefined, {
      isSensor: true,
      isStatic: true,
    });

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.ITEM;

    this.setScale(0.677);
    this.itemType = itemType;
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'item',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, itemType: ItemTypes) {
    const sprite = new Item(this.scene.matter.world, x, y, itemType);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
