import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import collisionHandler from '../game_engine/collision_handler/collision_handler';
import Network from '../services/Network';
import { NavKeys } from '../types/keyboard';
import { getGameScene } from '../utils/globalGame';
import Player from './Player';

export default class MyPlayer extends Player {
  private serverX: number;
  private serverY: number;

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
    name?: string,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(sessionId, world, x, y, texture, frame, name, options);
    this.serverX = x;
    this.serverY = y;
    this.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
      const currBody = this.body as MatterJS.BodyType;
      data.bodyA.id === currBody.id
        ? collisionHandler(data.bodyA, data.bodyB)
        : collisionHandler(data.bodyB, data.bodyA);
    });
    this.addNameLabel(Constants.BLUE);
  }

  // player.onChange のコールバック
  handleServerChange(player: ServerPlayer) {
    if (this.isDead()) return;
    this.serverX = player.x;
    this.serverY = player.y;
    this.forceMovePlayerPosition(player);
    this.setHP(player.hp);
    if (this.isDead()) {
      this.died();
    }
    this.setSpeed(player.speed);
    this.setBombType(player.bombType);
    this.setBombStrength(player.bombStrength);
    this.setMaxBombCount(player.maxBombCount);
  }

  update(cursorKeys: NavKeys, network: Network) {
    if (this.isDead()) return false;

    // サーバの位置に合わせて移動
    this.setPosition(this.serverX, this.serverY);
    this.nameLabel.setPosition(this.x, this.y - 30);

    // キーボードの入力をサーバに送信
    this.inputPayload.left = cursorKeys.left.isDown || cursorKeys.A.isDown;
    this.inputPayload.right = cursorKeys.right.isDown || cursorKeys.D.isDown;
    this.inputPayload.up = cursorKeys.up.isDown || cursorKeys.W.isDown;
    this.inputPayload.down = cursorKeys.down.isDown || cursorKeys.S.isDown;

    const isInput =
      (this.inputPayload.left ||
        this.inputPayload.right ||
        this.inputPayload.up ||
        this.inputPayload.down) &&
      !document.hidden;

    // アニメーションの結果はフロントで管理するため、dummy Player を先に移動させて frame を送る。
    let vx = 0; // velocity x
    let vy = 0; // velocity y

    if (isInput) {
      const velocity = this.getSpeed();
      if (this.inputPayload.left) vx -= velocity;
      if (this.inputPayload.right) vx += velocity;
      if (this.inputPayload.up) vy -= velocity;
      if (this.inputPayload.down) vy += velocity;
    }

    let anim: string;
    if (vx > 0) {
      anim = `${this.character}_right`;
      this.lastDirection = 'right';
    } else if (vx < 0) {
      anim = `${this.character}_left`;
      this.lastDirection = 'left';
    } else if (vy > 0) {
      anim = `${this.character}_down`;
      this.lastDirection = 'down';
    } else if (vy < 0) {
      anim = `${this.character}_up`;
      this.lastDirection = 'up';
    } else {
      anim = `${this.character}_idle_${this.lastDirection}`;
    }
    if (!this.dmgAnimPlaying) this.play(anim, true);

    network.sendPlayerMove(this, this.inputPayload, isInput);

    // bomb 設置
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(cursorKeys.space);
    if (isSpaceJustDown) {
      this.placeBomb();
    }
  }

  // ボムを置く
  placeBomb() {
    const game = getGameScene();

    if (!this.canSetBomb()) return;

    // サーバにボムを置いたことを通知
    game.getNetwork().sendPlayerBomb(this);
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
    name?: string,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const sprite = new MyPlayer(
      sessionId,
      this.scene.matter.world,
      x,
      y,
      texture,
      frame,
      name,
      options
    );

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
