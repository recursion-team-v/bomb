/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';

// register to GameObjectFactory
import '../characters/MyPlayer';
import '../items/Bomb';
import '../items/Wall';
import '../items/Block';
import '../items/Item';

import { createPlayerAnims } from '../anims/PlayerAnims';
import { drawGround, drawWalls, drawBlocks } from '../utils/drawMap';
import { NavKeys } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import { createBombAnims } from '../anims/BombAnims';
import { createExplodeAnims } from '../anims/explodeAnims';
import * as Config from '../config/config';
import { Room } from 'colyseus.js';
import * as Constants from '../../../backend/src/constants/constants';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import { Bomb as ServerBomb } from '../../../backend/src/rooms/schema/Bomb';
import GameRoomState from '../../../backend/src/rooms/schema/GameRoomState';
import Bomb from '../items/Bomb';
import initializeKeys from '../utils/key';
import Network from '../services/Network';

export default class Game extends Phaser.Scene {
  private network!: Network;
  private room!: Room<GameRoomState>;
  private readonly playerEntities: Map<string, MyPlayer> = new Map();
  private myPlayer!: MyPlayer; // 操作しているプレイヤーオブジェクト

  private elapsedTime: number = 0; // 経過時間
  private readonly fixedTimeStep: number = Constants.FRAME_RATE; // 1フレームの経過時間
  private remoteRef!: Phaser.GameObjects.Rectangle; // サーバ側が認識するプレイヤーの位置を示す四角形

  inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  cursorKeys!: NavKeys;

  constructor() {
    super(Config.SCENE_NAME_GAME);
  }

  init() {
    // initialize key inputs
    this.cursorKeys = initializeKeys(this);
  }

  create(data: { network: Network }) {
    if (data.network == null) return;
    this.network = data.network;
    if (this.network.room == null) return;
    this.room = this.network.room;

    // プレイヤーをゲームに追加
    this.room.state.players.forEach((player, sessionId) => {
      if (sessionId === this.network.mySessionId) {
        this.addMyPlayer(); // 自分を追加
      } else {
        this.handlePlayerJoinedRoom(player, sessionId); // 既に参加しているプレイヤーを追加
      }
    });

    this.network.onPlayerJoinedRoom(this.handlePlayerJoinedRoom, this); // 他のプレイヤーの参加イベント
    this.network.onTimerUpdated(this); // タイマーの変更イベント
    this.network.onGameStateUpdated(this); // gameStateの変更イベント
    // TODO: アイテムをとって火力が上がった場合の処理を追加する
    this.network.onBombAdded(this.handleBombAdded, this); // 他のプレイヤーのボム追加イベント
    this.network.onPlayerLeftRoom(this.handlePlayerLeftRoom, this); // プレイヤーの切断イベント

    // add player animations
    createPlayerAnims(this.anims);
    createBombAnims(this.anims);
    createExplodeAnims(this.anims);

    // add items
    this.addItems();

    this.room.onStateChange.once((state) => {
      // GameRoomState の blockArr が初期化されたら block（破壊）を描画
      const mapTiles = state.gameMap.mapTiles;
      // draw ground
      drawGround(this, mapTiles.GROUND_IDX);
      // draw walls
      drawWalls(this, mapTiles);
      // draw blocks
      drawBlocks(this, state.gameMap.blockArr);
    });
  }

  update(time: number, delta: number) {
    this.updateBombCollision();

    if (this.myPlayer === undefined) return;

    // 前回の処理からの経過時間を算出し、1フレームの経過時間を超えていたら処理を実行する
    // https://learn.colyseus.io/phaser/4-fixed-tickrate.html
    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick();
    }
  }

  private fixedTick() {
    this.moveOwnPlayer();
    this.moveOtherPlayer();
  }

  private addMyPlayer() {
    const player = this.room.state.players.get(this.network.mySessionId);
    if (player === undefined) return;

    const myPlayer = this.add.myPlayer(this.network.mySessionId, player.x, player.y, 'player');
    this.playerEntities.set(this.network.mySessionId, myPlayer);
    this.myPlayer = myPlayer;

    // サーバ側が認識するプレイヤーの位置を示す四角形
    this.remoteRef = this.add.rectangle(
      player.x,
      player.y,
      myPlayer.width,
      myPlayer.height,
      0xfff,
      0.3
    );

    player.onChange = () => {
      this.remoteRef.setPosition(player.x, player.y);

      // ずれが一定以上の場合は強制移動
      this.forceMovePlayerPosition(player);
    };
  }

  private handlePlayerJoinedRoom(player: ServerPlayer, sessionId: string) {
    const otherPlayer = this.add.myPlayer(sessionId, player.x, player.y, 'player');
    this.playerEntities.set(sessionId, otherPlayer);

    // プレイヤー同士はぶつからないようにする
    otherPlayer.setSensor(true);

    const randomColor = Math.floor(Math.random() * 16777215);
    otherPlayer.setPlayerColor(randomColor);
    player.onChange = () => {
      const otherPlayer = this.playerEntities.get(sessionId);
      if (otherPlayer === undefined) return;
      otherPlayer.setData('serverX', player.x);
      otherPlayer.setData('serverY', player.y);
    };
  }

  private handlePlayerLeftRoom(player: ServerPlayer, sessionId: string) {
    const entity = this.playerEntities.get(sessionId);
    entity?.destroy();

    this.playerEntities.delete(sessionId);
    console.log('remove' + sessionId);
  }

  // ボム追加イベント時に、マップにボムを追加
  private handleBombAdded(serverBomb: ServerBomb) {
    if (serverBomb === undefined) return;

    const sessionId = serverBomb.owner.sessionId;

    // 自分のボムは表示しない
    if (this.myPlayer.isEqualSessionId(sessionId)) return;

    const player = this.playerEntities.get(sessionId);
    if (player === undefined) return;

    this.add.bomb(sessionId, serverBomb.x, serverBomb.y, serverBomb.bombStrength, player);
  }

  // 一定以上のズレなら強制同期
  private forceMovePlayerPosition(player: ServerPlayer) {
    let forceX = 0;
    let forceY = 0;

    if (Math.abs(this.myPlayer.x - player.x) > Constants.PLAYER_TOLERANCE_DISTANCE) {
      forceX = (this.myPlayer.x - player.x) * -1;
    }

    if (Math.abs(this.myPlayer.y - player.y) > Constants.PLAYER_TOLERANCE_DISTANCE) {
      forceY = (this.myPlayer.y - player.y) * -1;
    }

    if (forceX === 0 && forceY === 0) return;
    console.log('force move');
    this.myPlayer.setVelocity(forceX, forceY);
  }

  // ボム設置後、プレイヤーの挙動によってボムの衝突判定を更新する
  private updateBombCollision() {
    this.children.list.forEach((child: Phaser.GameObjects.GameObject) => {
      if (!(child instanceof Bomb)) return;

      const playerBody = this.myPlayer.body as MatterJS.BodyType;
      if (child.isSensor() && !child.isOverlapping(this.matter, playerBody)) {
        child.updateCollision();
      }
    });
  }

  // 他のプレイヤーの移動処理
  private moveOtherPlayer() {
    this.playerEntities.forEach((otherPlayer: MyPlayer, sessionId: string) => {
      if (otherPlayer === undefined || otherPlayer.data == null) return;
      if (sessionId === this.network.mySessionId) return;

      // interpolate all player entities
      const { serverX, serverY } = otherPlayer.data.values;

      const oldX = otherPlayer.x;
      const oldY = otherPlayer.y;

      // 壁にちょっと触れるだけで移動扱いでアニメーションが発生するので
      // ほぼ同じ位置なら移動しないようにする(*10は少数第一位までを比較するため)
      if (
        Math.floor(serverX * 10) === Math.floor(oldX * 10) &&
        Math.floor(serverY * 10) === Math.floor(oldY * 10)
      ) {
        otherPlayer.stop();
        return;
      }

      // 線形補完(TODO: 調整)
      otherPlayer.x = Phaser.Math.Linear(otherPlayer.x, serverX, 0.35); // 動きがちょっと滑らか過ぎるから 0.2 -> 0.35
      otherPlayer.y = Phaser.Math.Linear(otherPlayer.y, serverY, 0.35);

      this.playerAnims(otherPlayer, oldX, oldY);
    });
  }

  // 自分が操作するキャラの移動処理
  private moveOwnPlayer() {
    const p = this.myPlayer;

    // send input to the server
    this.inputPayload.left = this.cursorKeys.left.isDown || this.cursorKeys.A.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown || this.cursorKeys.D.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown || this.cursorKeys.W.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown || this.cursorKeys.S.isDown;

    let vx = 0; // velocity x
    let vy = 0; // velocity y

    const velocity = p.speed;
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

    p.setVelocity(vx, vy);

    this.room.send(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, p);

    if (vx > 0) p.play('player_right', true);
    else if (vx < 0) p.play('player_left', true);
    else if (vy > 0) p.play('player_down', true);
    else if (vy < 0) p.play('player_up', true);
    else p.stop();

    // bomb 設置
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);
    if (isSpaceJustDown) {
      this.room.send(Constants.NOTIFICATION_TYPE.PLAYER_BOMB, p);
      p.placeBomb(this.matter);
    }
  }

  // 移動アニメーション
  private playerAnims(localPlayer: MyPlayer, oldX: number, oldY: number) {
    const xDiff = localPlayer.x - oldX;
    const yDiff = localPlayer.y - oldY;

    // 変化量の大きい方を向きとする
    const direction = () => {
      if (Math.abs(xDiff) > Math.abs(yDiff)) return 'horizontal';
      if (Math.abs(xDiff) < Math.abs(yDiff)) return 'vertical';
      return 'none';
    };

    let playKey = '';
    if (direction() === 'horizontal') {
      playKey = xDiff > 0 ? 'player_right' : 'player_left';
    } else if (direction() === 'vertical') {
      playKey = yDiff > 0 ? 'player_down' : 'player_up';
    } else {
      localPlayer.stop();
      return;
    }

    localPlayer.play(playKey, true);
  }

  private addItems() {
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
      Constants.ITEM_TYPE.BOMB_STRENGTH
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
      Constants.ITEM_TYPE.BOMB_STRENGTH
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
      Constants.ITEM_TYPE.BOMB_STRENGTH
    );

    const bombPossessionUpCount = 10;
    for (let i = 0; i < bombPossessionUpCount; i++) {
      this.add.item(
        64 * Phaser.Math.Between(1, 13) + 32,
        64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
        Constants.ITEM_TYPE.BOMB_POSSESSION_UP
      );
    }

    // this.add.item(
    //   64 * Phaser.Math.Between(1, 13) + 32,
    //   64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
    //   ItemTypes.PLAYER_SPEED
    // );
  }

  public getCurrentPlayer(): MyPlayer {
    return this.myPlayer;
  }
}
