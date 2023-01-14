import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import * as Config from '../config/config';
import Network from '../services/Network';
import { NavKeys } from '../types/keyboard';
import { getGameScene } from '../utils/globalGame';
import Player from './Player';

export default class MyPlayer extends Player {
  private serverX: number;
  private serverY: number;
  private readonly dead_se;
  private readonly item_get_se;

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
    this.dead_se = this.scene.sound.add('gameOver', {
      volume: Config.SOUND_VOLUME * 1.5,
    });
    this.item_get_se = this.scene.sound.add('getItem', {
      volume: Config.SOUND_VOLUME * 1.5,
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
      this.scene.time.addEvent({
        delay: 1000,
        callback: () => {
          this.dead_se.play();
        },
      });
    }
    this.setSpeed(player.speed);
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

    if (vx > 0) this.play('player_right', true);
    else if (vx < 0) this.play('player_left', true);
    else if (vy > 0) this.play('player_down', true);
    else if (vy < 0) this.play('player_up', true);
    else this.stop();

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

  setMaxBombCount(maxBombCount: number): boolean {
    if (super.setMaxBombCount(maxBombCount)) this.playItemGetSe();
    return true;
  }

  setBombStrength(bombStrength: number): boolean {
    if (super.setBombStrength(bombStrength)) this.playItemGetSe();
    return true;
  }

  setSpeed(speed: number): boolean {
    if (super.setSpeed(speed)) this.playItemGetSe();
    return true;
  }

  private playItemGetSe() {
    this.item_get_se.play();
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
