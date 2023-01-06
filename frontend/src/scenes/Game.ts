/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';

// register to GameObjectFactory
import '../characters/MyPlayer';
import '../characters/OtherPlayer';
import '../items/Bomb';
import '../items/Wall';
import '../items/Block';
import '../items/Item';

import { drawGround, drawWalls, drawBlocks } from '../utils/drawMap';
import { NavKeys } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import * as Config from '../config/config';
import { Room } from 'colyseus.js';
import * as Constants from '../../../backend/src/constants/constants';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import { Bomb as ServerBomb } from '../../../backend/src/rooms/schema/Bomb';
import GameRoomState from '../../../backend/src/rooms/schema/GameRoomState';
import Bomb from '../items/Bomb';
import initializeKeys from '../utils/key';
import Network from '../services/Network';
import GameHeader from './GameHeader';
import OtherPlayer from '../characters/OtherPlayer';

export default class Game extends Phaser.Scene {
  private network!: Network;
  private room!: Room<GameRoomState>;
  private readonly otherPlayers: Map<string, OtherPlayer> = new Map();
  private myPlayer!: MyPlayer; // 操作しているプレイヤーオブジェクト
  cursorKeys!: NavKeys;

  private elapsedTime: number = 0; // 経過時間
  private readonly fixedTimeStep: number = Constants.FRAME_RATE; // 1フレームの経過時間

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
    this.addPlayers();

    // Colyseus のイベントを追加
    this.initNetworkEvents();

    // add items
    this.addItems();

    // TODO: Preloader（Lobby）で読み込んで Game Scene に渡す
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
    this.moveOtherPlayers();
    this.updateBombCollision();
  }

  private initNetworkEvents() {
    this.network.onPlayerJoinedRoom(this.handlePlayerJoinedRoom, this); // 他のプレイヤーの参加イベント
    this.network.onTimerUpdated(this.handleTimerUpdated, this); // タイマーの変更イベント
    this.network.onGameStateUpdated(this.handleGameStateChanged, this); // gameStateの変更イベント
    // TODO: アイテムをとって火力が上がった場合の処理を追加する
    this.network.onBombAdded(this.handleBombAdded, this); // 他のプレイヤーのボム追加イベント
    this.network.onPlayerLeftRoom(this.handlePlayerLeftRoom, this); // プレイヤーの切断イベント
  }

  private addPlayers() {
    this.room.state.players.forEach((player, sessionId) => {
      if (sessionId === this.network.mySessionId) {
        this.addMyPlayer(); // 自分を追加
      } else {
        this.handlePlayerJoinedRoom(player, sessionId); // 既に参加しているプレイヤーを追加
      }
    });
  }

  private addMyPlayer() {
    const player = this.room.state.players.get(this.network.mySessionId);
    if (player === undefined) return;
    const myPlayer = this.add.myPlayer(this.network.mySessionId, player.x, player.y, 'player');
    this.myPlayer = myPlayer;

    player.onChange = () => {
      this.myPlayer.handleServerChange(player);
    };
  }

  private handlePlayerJoinedRoom(player: ServerPlayer, sessionId: string) {
    const otherPlayer = this.add.otherPlayer(sessionId, player.x, player.y, 'player');
    this.otherPlayers.set(sessionId, otherPlayer);

    player.onChange = () => {
      otherPlayer.handleServerChange(player.x, player.y, player.frameKey);
    };
  }

  private handlePlayerLeftRoom(player: ServerPlayer, sessionId: string) {
    const otherPlayer = this.otherPlayers.get(sessionId);
    otherPlayer?.destroy();
    this.otherPlayers.delete(sessionId);
  }

  private handleTimerUpdated(data: any) {
    const sc = this.scene.get(Config.SCENE_NAME_GAME_HEADER) as GameHeader;
    data.forEach((v: any) => {
      if (v.field === 'remainTime') sc.updateTimerText(v.value);
    });
  }

  private async handleGameStateChanged(data: any) {
    const state = data[0].value as Constants.GAME_STATE_TYPE;

    if (state === Constants.GAME_STATE.FINISHED && this.room !== undefined) {
      await this.room.leave();
      this.scene.stop(Config.SCENE_NAME_GAME_HEADER);
      this.scene.stop(Config.SCENE_NAME_GAME);
      this.scene.start(Config.SCENE_NAME_GAME_RESULT);
    }
  }

  // ボム追加イベント時に、マップにボムを追加
  private handleBombAdded(serverBomb: ServerBomb) {
    if (serverBomb === undefined) return;

    const sessionId = serverBomb.owner.sessionId;

    // 自分のボムは表示しない
    if (this.myPlayer.isEqualSessionId(sessionId)) return;

    const otherPlayer = this.otherPlayers.get(sessionId);
    if (otherPlayer === undefined) return;

    this.add.bomb(sessionId, serverBomb.x, serverBomb.y, serverBomb.bombStrength, otherPlayer);
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

  // 自分が操作するキャラの移動処理
  private moveOwnPlayer() {
    if (this.myPlayer === undefined || this.network === undefined) return;
    this.myPlayer.update(this.cursorKeys, this.network);
  }

  // 他のプレイヤーの移動処理
  private moveOtherPlayers() {
    this.otherPlayers.forEach((otherPlayer: OtherPlayer) => {
      otherPlayer.update();
    });
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
