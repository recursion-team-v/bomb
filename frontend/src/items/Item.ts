import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import { getDepth } from './util';
import * as Config from '../config/config';

export default class Item extends Phaser.Physics.Matter.Sprite {
  public readonly itemType: Constants.ITEM_TYPES;
  private readonly tween?: Phaser.Tweens.Tween;
  private readonly se;

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    itemType: Constants.ITEM_TYPES
  ) {
    super(world, x, y + 5, itemType, undefined, {
      isSensor: true,
      isStatic: true,
    });

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.ITEM;

    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS));
    this.setScale(0.45);
    this.itemType = itemType;

    this.tween = this.scene.tweens.add({
      targets: this,
      y: y - 5,
      repeat: -1,
      yoyo: true,
      duration: 700,
      ease: Phaser.Math.Easing.Bounce,
    });
    this.se = this.scene.sound.add('getItem', {
      volume: Config.SOUND_VOLUME * 1.5,
    });
  }

  removeItem() {
    this.se.play();
    this.tween?.remove();
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
