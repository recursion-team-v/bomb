import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import Player from './Player';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import { NavKeys } from '../types/keyboard';
import Network from '../services/Network';

export default class MyPlayer extends Player {
  private readonly remoteRef: Phaser.GameObjects.Rectangle;

  inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

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
    this.remoteRef = this.scene.add.rectangle(this.x, this.y, this.width, this.height, 0xfff, 0.3);
  }

  // player.onChange のコールバック
  handleServerChange(player: ServerPlayer) {
    if (this.isDead()) return;

    this.updateRemoteRef(player);
    this.forceMovePlayerPosition(player);
    this.setHP(player.hp);
    if (this.isDead()) this.died();
  }

  // サーバのプレイヤーの位置を反映させる
  private updateRemoteRef(player: ServerPlayer) {
    if (this.isDead()) return;
    this.remoteRef.setPosition(player.x, player.y);
  }

  update(cursorKeys: NavKeys, network: Network) {
    if (this.isDead()) return false;

    // send input to the server
    this.inputPayload.left = cursorKeys.left.isDown || cursorKeys.A.isDown;
    this.inputPayload.right = cursorKeys.right.isDown || cursorKeys.D.isDown;
    this.inputPayload.up = cursorKeys.up.isDown || cursorKeys.W.isDown;
    this.inputPayload.down = cursorKeys.down.isDown || cursorKeys.S.isDown;

    let vx = 0; // velocity x
    let vy = 0; // velocity y

    const velocity = this.getSpeed();
    if (this.inputPayload.left) {
      vx -= velocity;
    } else if (this.inputPayload.right) {
      vx += velocity;
    }

    if (this.inputPayload.up) {
      vy -= velocity;
    } else if (this.inputPayload.down) {
      vy += velocity;
    }

    this.setVelocity(vx, vy);

    network.sendPlayerMove(this);

    if (vx > 0) this.play('player_right', true);
    else if (vx < 0) this.play('player_left', true);
    else if (vy > 0) this.play('player_down', true);
    else if (vy < 0) this.play('player_up', true);
    else this.stop();

    // bomb 設置
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(cursorKeys.space);
    if (isSpaceJustDown) {
      network.sendPlayerBomb(this);
      this.placeBomb(this.scene.matter);
    }
  }

  private forceMovePlayerPosition(player: ServerPlayer) {
    let forceX = 0;
    let forceY = 0;

    if (Math.abs(this.x - player.x) > Constants.PLAYER_TOLERANCE_DISTANCE) {
      forceX = player.x - this.x;
    }

    if (Math.abs(this.y - player.y) > Constants.PLAYER_TOLERANCE_DISTANCE) {
      forceY = player.y - this.y;
    }

    if (forceX === 0 && forceY === 0) return;
    console.log('force move');
    this.setVelocity(forceX, forceY);
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
