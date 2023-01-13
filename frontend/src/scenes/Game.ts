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
import ServerItem from '../../../backend/src/rooms/schema/Item';
import ServerBlast from '../../../backend/src/rooms/schema/Blast';
import GameRoomState from '../../../backend/src/rooms/schema/GameRoomState';
import Bomb from '../items/Bomb';
import Item from '../items/Item';
import initializeKeys from '../utils/key';
import Network from '../services/Network';
import OtherPlayer from '../characters/OtherPlayer';
import { Block } from '../items/Block';
import phaserJuice from '../lib/phaserJuice';
import GameQueue from '../../../backend/src/utils/gameQueue';
import PlacementObjectInterface from '../../../backend/src/interfaces/placement_object';
import { createBomb } from '../services/Bomb';

export default class Game extends Phaser.Scene {
  private network!: Network;
  private room!: Room<GameRoomState>;
  private readonly otherPlayers: Map<string, OtherPlayer> = new Map();
  private myPlayer!: MyPlayer; // 操作しているプレイヤーオブジェクト
  cursorKeys!: NavKeys;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private cols!: number; // サーバから受け取ったマップの列数
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private rows!: number; // サーバから受け取ったマップの行数
  private serverTime: number = 0; // サーバの時間
  private elapsedTime: number = 0; // 経過時間
  private readonly fixedTimeStep: number = Constants.FRAME_RATE; // 1フレームの経過時間
  private currBlocks?: Map<string, Block>; // 現在存在しているブロック
  private readonly bombToCreateQueue: GameQueue<ServerBomb> = new GameQueue<ServerBomb>();
  private readonly currItems: Map<string, Item>; // 現在存在しているアイテム
  private readonly currBombs: Map<string, Phaser.GameObjects.Arc>; // 現在存在しているボム
  private readonly currBlasts: Map<string, Phaser.GameObjects.Arc>; // 現在存在しているサーバの爆風
  private bgm?: Phaser.Sound.BaseSound;
  private readonly juice: phaserJuice;

  constructor() {
    super(Config.SCENE_NAME_GAME);
    this.currItems = new Map();
    this.currBombs = new Map();
    this.currBlasts = new Map();
    // eslint-disable-next-line new-cap
    this.juice = new phaserJuice(this);
  }

  init() {
    // initialize key inputs
    this.cursorKeys = initializeKeys(this);
    this.bgm = this.sound.add('stage_2', {
      volume: Config.SOUND_VOLUME,
    });

    this.bgm.play({
      loop: true,
    });
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

    // TODO: Preloader（Lobby）で読み込んで Game Scene に渡す
    this.room.onStateChange.once((state) => {
      // GameRoomState の blockArr が初期化されたら block（破壊）を描画
      const mapTiles = state.gameMap.mapTiles;
      this.rows = state.gameMap.rows;
      this.cols = state.gameMap.cols;

      drawGround(this, mapTiles.GROUND_IDX); // draw ground
      drawWalls(this, mapTiles); // draw walls
      this.currBlocks = drawBlocks(this, state.blocks); // draw blocks
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
    this.placeObjectFromQueue(this.bombToCreateQueue, (v: PlacementObjectInterface) =>
      createBomb(v)
    );
    this.updateBombCollision();
  }

  private initNetworkEvents() {
    this.network.onPlayerJoinedRoom(this.handlePlayerJoinedRoom, this); // 他のプレイヤーの参加イベント
    this.network.onGameStateUpdated(this.handleGameStateChanged, this); // gameStateの変更イベント
    // TODO: アイテムをとって火力が上がった場合の処理を追加する
    this.network.onBombAdded(this.handleBombAdded, this); // プレイヤーのボム追加イベント
    this.network.onBombRemoved(this.handleBombRemoved, this);
    this.network.onPlayerLeftRoom(this.handlePlayerLeftRoom, this); // プレイヤーの切断イベント
    this.network.onBlocksRemoved(this.handleBlocksRemoved, this);
    this.network.onItemAdded(this.handleItemAdded, this);
    this.network.onItemRemoved(this.handleItemRemoved, this);
    if (Config.DEBUG_IS_SHOW_SERVER_BLAST) {
      this.network.onBlastAdded(this.handleBlastAdded, this);
      this.network.onBlastRemoved(this.handleBlastRemoved, this);
    }
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
      otherPlayer.handleServerChange(player);
    };
  }

  private handlePlayerLeftRoom(player: ServerPlayer, sessionId: string) {
    const otherPlayer = this.otherPlayers.get(sessionId);
    otherPlayer?.destroy();
    this.otherPlayers.delete(sessionId);
  }

  private async handleGameStateChanged(data: any) {
    const state = data[0].value as Constants.GAME_STATE_TYPE;

    if (state === Constants.GAME_STATE.FINISHED && this.room !== undefined) {
      await this.room.leave();
      this.bgm?.stop();
      this.scene.stop(Config.SCENE_NAME_GAME_HEADER);
      this.scene.stop(Config.SCENE_NAME_GAME);
      this.scene.start(Config.SCENE_NAME_GAME_RESULT);
    }
  }

  // ボム追加イベント時に、マップにボムを追加
  private handleBombAdded(serverBomb: ServerBomb) {
    if (serverBomb === undefined) return;
    this.bombToCreateQueue.enqueue(serverBomb);

    if (Config.DEBUG_IS_SHOW_SERVER_BOMB) {
      const bomb = this.add
        .circle(serverBomb.x, serverBomb.y, Constants.DEFAULT_TIP_SIZE / 6, Constants.BLUE)
        .setDepth(Constants.OBJECT_DEPTH.WALL - 1);
      this.currBombs.set(serverBomb.id, bomb);
    }
  }

  // ボム追加イベント時に、マップにボムを追加
  private handleBombRemoved(serverBomb: ServerBomb) {
    if (Config.DEBUG_IS_SHOW_SERVER_BOMB) {
      const body = this.currBombs.get(serverBomb.id);
      if (body === undefined) return;
      this.currBombs.delete(serverBomb.id);
      body.destroy();
    }
  }

  // 破壊されたブロックにアイテムタイプがあればアイテムを追加する。
  private handleBlocksRemoved(data: any) {
    const { id } = data;
    const blockBody = this.currBlocks?.get(id);
    if (blockBody === undefined) return;
    this.currBlocks?.delete(id);

    const juice = this.juice;

    // ブロック破壊のアニメーション
    const timer = setInterval(() => {
      juice.flash(blockBody, 30, Constants.RED.toString());
    }, 30);

    setTimeout(() => {
      clearInterval(timer);
      blockBody.destroy();
    }, 500);
  }

  // サーバの爆風を描画する
  private handleBlastAdded(serverBlast: ServerBlast) {
    if (serverBlast === undefined) return;
    const blast = this.add
      .circle(serverBlast.x, serverBlast.y, Constants.DEFAULT_TIP_SIZE / 6, Constants.GREEN)
      .setDepth(Constants.OBJECT_DEPTH.WALL - 1);
    this.currBlasts.set(serverBlast.id, blast);
  }

  // サーバの爆風を削除する
  private handleBlastRemoved(data: any) {
    const { id } = data;
    const body = this.currBlasts.get(id);
    if (body === undefined) return;
    this.currBlasts.delete(id);
    body.destroy();
  }

  // アイテム追加イベント時に、マップにアイテムを追加
  private handleItemAdded(serverItem: ServerItem) {
    if (serverItem === undefined) return;
    const item = this.add.item(serverItem.x, serverItem.y, serverItem.itemType);
    this.currItems.set(serverItem.id, item);
  }

  // アイテムが破壊・習得されたらアイテムを削除する
  private handleItemRemoved(data: any) {
    const { id } = data;
    const itemBody = this.currItems.get(id);
    if (itemBody === undefined) return;
    this.currItems.delete(id);

    const juice = this.juice;

    // ブロック破壊のアニメーション
    const timer = setInterval(() => {
      juice.flash(itemBody, 30, Constants.RED.toString());
    }, 30);

    setTimeout(() => {
      clearInterval(timer);
      itemBody.removeItem();
    }, 500);
  }

  // キューに溜まっているオブジェクトをマップに追加する
  private placeObjectFromQueue(queue: GameQueue<PlacementObjectInterface>, callback: Function) {
    if (queue.isEmpty()) return;

    const data = queue.read();
    if (data === undefined) return;
    if (data.createdAt >= this.serverTime) {
      callback(data);
      queue.dequeue();
    }
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

  public getCurrentPlayer(): MyPlayer {
    return this.myPlayer;
  }

  public getOtherPlayers(): Map<string, OtherPlayer> {
    return this.otherPlayers;
  }

  public getCols(): number {
    return this.cols;
  }

  public getRows(): number {
    return this.rows;
  }

  public getServerTime(): number {
    return this.serverTime;
  }

  public setServerTime(value: number) {
    this.serverTime = value;
  }

  public getNetwork(): Network {
    return this.network;
  }

  public getJuice(): phaserJuice {
    return this.juice;
  }

  // sessionId からプレイヤーのボムの強さを取得する
  public getBombStrength(sessionId: string): number {
    if (this.myPlayer.isEqualSessionId(sessionId)) {
      return this.myPlayer.getBombStrength();
    }

    const otherPlayer = this.otherPlayers.get(sessionId);
    if (otherPlayer === undefined) return 0;
    return otherPlayer.getBombStrength();
  }
}
