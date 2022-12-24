import Phaser from 'phaser';

export default class Bomb extends Phaser.Physics.Matter.Sprite {
  public thermalPower: number = 1;
  exploade() {}
  setThermalPower(thermalPower: number): void {
    this.thermalPower = thermalPower;
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'bomb',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const sprite = new Bomb(this.scene.matter.world, x, y, texture, frame, options);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    sprite.setScale(3, 3);
    // sprite.setPlayerColor(Math.random() * 0xffffff);

    return sprite;
  }
);
