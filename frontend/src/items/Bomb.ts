import Phaser from 'phaser';

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

  explode() {
    this.scene.add.bombExplosion(this.x, this.y, this.bombStrength);
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
