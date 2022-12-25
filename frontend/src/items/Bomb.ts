import Phaser from 'phaser';

export default class Bomb extends Phaser.Physics.Matter.Sprite {
  public thermalPower: number = 1;

  setThermalPower(thermalPower: number): void {
    this.thermalPower = thermalPower;
  }

  explode(x: number, y: number) {
    this.scene.time.addEvent({
      delay: 3000,
      callback: () => {
        const group = this.scene.add.group();
        group.add(this.scene.add.sprite(x + 52, y, 'explosion', undefined).play('tip_explode'));

        group.add(
          this.scene.add
            .sprite(x, y + 50, 'explosion', undefined)
            .play('tip_explode')
            .setAngle(90)
        );

        group.add(this.scene.add.sprite(x, y, 'explosion', undefined).play('center_explode'));
        group.add(
          this.scene.add
            .sprite(x - 52, y, 'explosion', undefined)
            .play('tip_explode')
            .setAngle(180)
        );

        group.add(
          this.scene.add
            .sprite(x, y - 52, 'explosion', undefined)
            .play('tip_explode')
            .setAngle(270)
        );

        this.scene.time.addEvent({
          delay: 1000,
          callback: () => {
            group.destroy(true);
            this.destroy();
          },
        });
      },
    });
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
    sprite.setStatic(true);
    // sprite.setPlayerColor(Math.random() * 0xffffff);

    sprite.play('bomb_count');
    sprite.explode(x, y);

    return sprite;
  }
);
