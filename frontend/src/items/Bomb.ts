import Phaser from 'phaser';
import IngameConfig from '../config/ingameConfig';

export default class Bomb extends Phaser.Physics.Matter.Sprite {
  public thermalPower: number = 2;

  setThermalPower(thermalPower: number): void {
    this.thermalPower = thermalPower;
  }

  explode(x: number, y: number) {
    const group = this.world.scene.add.group();

    // add center explosion
    group.add(
      this.scene.add
        .sprite(x, y, 'bomb_center_explosion')
        .setScale(1.2, 1.2)
        .play('bomb_center_explosion')
    );

    // add horizontal explosions
    if (this.thermalPower > 1) {
      for (let i = 1; i < this.thermalPower; i++) {
        group.add(
          this.scene.add
            .sprite(x + IngameConfig.tileWidth * i, y, 'bomb_horizontal_explosion')
            .play('bomb_horizontal_explosion')
        );

        group.add(
          this.scene.add
            .sprite(x, y + IngameConfig.tileWidth * i, 'bomb_horizontal_explosion')
            .play('bomb_horizontal_explosion')
            .setFlipY(true)
            .setAngle(90)
        );

        group.add(
          this.scene.add
            .sprite(x - IngameConfig.tileWidth * i, y, 'bomb_horizontal_explosion')
            .play('bomb_horizontal_explosion')
            .setAngle(180)
        );

        group.add(
          this.scene.add
            .sprite(x, y - IngameConfig.tileWidth * i, 'bomb_horizontal_explosion')
            .play('bomb_horizontal_explosion')
            .setAngle(270)
        );
      }
    }

    // add horizontal end explosions
    group.add(
      this.scene.add
        .sprite(x + IngameConfig.tileWidth * this.thermalPower, y, 'bomb_horizontal_end_explosion')
        .play('bomb_horizontal_end_explosion')
    );

    group.add(
      this.scene.add
        .sprite(x, y + IngameConfig.tileWidth * this.thermalPower, 'bomb_horizontal_end_explosion')
        .play('bomb_horizontal_end_explosion')
        .setFlipY(true)
        .setAngle(90)
    );

    group.add(
      this.scene.add
        .sprite(x - IngameConfig.tileWidth * this.thermalPower, y, 'bomb_horizontal_end_explosion')
        .play('bomb_horizontal_end_explosion')
        .setAngle(180)
    );

    group.add(
      this.scene.add
        .sprite(x, y - IngameConfig.tileWidth * this.thermalPower, 'bomb_horizontal_end_explosion')
        .play('bomb_horizontal_end_explosion')
        .setAngle(270)
    );

    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        group.destroy(true);
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

    sprite.setStatic(true);

    sprite.play('bomb_count', false);
    // bomb_count アニメーションが終わったら explode
    sprite.once('animationcomplete', () => {
      sprite.explode(x, y);
      sprite.destroy();
    });

    return sprite;
  }
);
