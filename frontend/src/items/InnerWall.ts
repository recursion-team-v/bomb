import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';

export default class InnerWall extends Phaser.Physics.Matter.Sprite {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, texture: string) {
    super(world, x, y, texture, undefined);

    this.setRectangle(Constants.DEFAULT_TIP_SIZE, Constants.DEFAULT_TIP_SIZE, {
      chamfer: {
        radius: 25,
      },
    });
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'innerWall',
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
    const sprite = new InnerWall(this.scene.matter.world, x, y, 'innerWall');

    this.displayList.add(sprite);
    this.updateList.add(sprite);
    sprite.setStatic(true);
    sprite.setScale(1, 1);
    sprite.setFrame(3);
    return sprite;
  }
);
