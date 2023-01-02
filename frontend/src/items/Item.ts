import Phaser from 'phaser';
import { ObjectTypes } from '../types/objects';
import { ItemTypes } from '../types/items';

export default class Item extends Phaser.Physics.Matter.Sprite {
  public readonly itemType: ItemTypes;
  private readonly tween?: Phaser.Tweens.Tween;

  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, itemType: ItemTypes) {
    super(world, x, y + 5, itemType, undefined, {
      isSensor: true,
      isStatic: true,
    });

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.ITEM;

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
  }

  removeItem() {
    this.tween?.remove();
    this.destroy();
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

// import Phaser from 'phaser';
// import { ObjectTypes } from '../types/objects';
// import { ItemTypes } from '../types/items';

// export default class Item extends Phaser.Physics.Matter.Sprite {
//   public readonly itemType: ItemTypes;
//   private readonly tween?: Phaser.Tweens.Tween;

//   constructor(world: Phaser.Physics.Matter.World, x: number, y: number, itemType: ItemTypes) {
//     super(world, x, y, itemType, undefined, {
//       isSensor: true,
//       isStatic: true,
//     });

//     const body = this.body as MatterJS.BodyType;
//     body.label = ObjectTypes.ITEM;

//     this.setScale(1.5, 1.5);
//     this.itemType = itemType;

//     this.tween = this.scene.tweens.add({
//       targets: this,
//       y: y - 10,
//       repeat: -1,
//       yoyo: true,
//       duration: 500,
//       ease: Phaser.Math.Easing.Bounce,
//     });
//   }

//   removeItem() {
//     this.tween?.remove();
//     this.destroy();
//   }
// }

// Phaser.GameObjects.GameObjectFactory.register(
//   'item',
//   function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, itemType: ItemTypes) {
//     const sprite = new Item(this.scene.matter.world, x, y, itemType);

//     this.displayList.add(sprite);
//     this.updateList.add(sprite);

//     return sprite;
//   }
// );
