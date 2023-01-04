import Phaser from 'phaser';
import Player from './Player';

import { ObjectTypes } from '../types/objects';

export default class MyPlayer extends Player {
  constructor(
    sessionId: string,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(sessionId, world, x, y, texture, frame, options);

    const body = this.body as MatterJS.BodyType;
    body.label = ObjectTypes.PLAYER;
  }
}

// register myPlayer to GameObjectFactory
// ゲームシーンの中で this.add.myPlayer() と呼べる様にする
Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    sessionId: string,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const sprite = new MyPlayer(sessionId, this.scene.matter.world, x, y, texture, frame, options);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
