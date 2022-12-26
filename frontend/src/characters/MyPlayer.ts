import Phaser from 'phaser';
import Player from './Player';
import { NavKeys } from '../types/keyboard';
import IngameConfig from '../config/ingameConfig';
import { ObjectTypes } from '../types/objects';
import Item from '../items/Item';
import { ItemTypes } from '../types/items';

export default class MyPlayer extends Player {
  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, frame, options);

    // change hitbox size
    this.setScale(1, 1);
    this.setRectangle(IngameConfig.defaultTipSize, IngameConfig.defaultTipSize, {
      chamfer: 100,
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
    });
    this.setOrigin(0.5, 0.5);
    this.setFixedRotation();
    this.play('player_down', true); // 最初は下向いてる

    this.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) =>
      this.handleCollide(data)
    );
  }

  // player controller handler
  update(cursors: NavKeys) {
    let vx = 0; // velocity x
    let vy = 0; // velocity y

    if (cursors.left.isDown || cursors.A.isDown) vx -= this.speed;
    if (cursors.right.isDown || cursors.D.isDown) vx += this.speed;
    if (cursors.up.isDown || cursors.W.isDown) vy -= this.speed;
    if (cursors.down.isDown || cursors.S.isDown) vy += this.speed;

    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(cursors.space);
    if (isSpaceJustDown) {
      this.placeBomb();
    }
    this.setVelocity(vx, vy);

    if (vx > 0) this.play('player_right', true);
    else if (vx < 0) this.play('player_left', true);
    else if (vy > 0) this.play('player_down', true);
    else if (vy < 0) this.play('player_up', true);
    else this.stop();
  }

  placeBomb() {
    this.scene.add.bomb(this.x, this.y, this.bombStrength);
  }

  private handleCollide(data: Phaser.Types.Physics.Matter.MatterCollisionData) {
    // bodyA <- myPlayer game object
    // bodyB <- collision object
    const { bodyB } = data;
    if (bodyB.gameObject == null) return;

    const goB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;
    const objectType = goB.getData('objectType') as ObjectTypes;

    if (objectType === ObjectTypes.ITEM) {
      const currItem = goB as Item;
      switch (currItem.itemType) {
        case ItemTypes.ITEM_BOMB_STRENGTH:
          this.setBombStrength(this.bombStrength + 1);
          currItem.destroy();
          break;

        case ItemTypes.ITEM_PLAYER_SPEED:
          this.setSpeed(this.speed + 1);
          currItem.destroy();
          break;

        default:
          break;
      }
    }
  }
}

// register myPlayer to GameObjectFactory
// ゲームシーンの中で this.add.myPlayer() と呼べる様にする
Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const sprite = new MyPlayer(this.scene.matter.world, x, y, texture, frame, options);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
