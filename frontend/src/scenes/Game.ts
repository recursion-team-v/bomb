/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';

// register to GameObjectFactory
import '../characters/MyPlayer';
import '../characters/OtherPlayer';
import '../characters/EnemyPlayer';
import '../items/Bomb';
import '../items/PenetrationBomb';
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
import ServerBlock from '../../../backend/src/rooms/schema/Block';
import ServerBlast from '../../../backend/src/rooms/schema/Blast';
import GameRoomState from '../../../backend/src/rooms/schema/GameRoomState';
import Bomb from '../items/Bomb';
import Item from '../items/Item';
import initializeKeys, { disableKeys, enableKeys } from '../utils/key';
import Network from '../services/Network';
import OtherPlayer from '../characters/OtherPlayer';
import { Block } from '../items/Block';
import phaserJuice from '../lib/phaserJuice';
import GameQueue from '../../../backend/src/utils/gameQueue';
import PlacementObjectInterface from '../../../backend/src/interfaces/placement_object';
import { createBomb } from '../services/Bomb';
import { gameEvents, Event } from '../events/GameEvents';
import { removeBlock } from '../services/Block';
import { dropWalls } from '../services/Map';
import { removeItem } from '../services/Item';
import GameResult from '../../../backend/src/rooms/schema/GameResult';
import ServerTimer from '../../../backend/src/rooms/schema/Timer';
import { getWinner } from '../utils/result';
import EnemyPlayer from '../characters/EnemyPlayer';

export default class Game extends Phaser.Scene {
  private network!: Network;
  private serverTimer?: ServerTimer;
  private room!: Room<GameRoomState>;

  private cursorKeys!: NavKeys;
  private rows!: number; // サーバから受け取ったマップの行数
  private cols!: number; // サーバから受け取ったマップの列数
  private elapsedTime: number = 0; // 経過時間
  private readonly fixedTimeStep: number = Constants.FRAME_RATE; // 1フレームの経過時間

  private myPlayer!: MyPlayer; // 操作しているプレイヤーオブジェクト
  private otherPlayers!: Map<string, OtherPlayer | EnemyPlayer>; // 他のプレイヤー
  private currBlocks?: Map<string, Block>; // 現在存在しているブロック
  private currItems!: Map<string, Item>; // 現在存在しているアイテム
  private currBombs!: Map<string, Phaser.GameObjects.Arc>; // 現在存在しているボム
  private currBlasts!: Map<string, Phaser.GameObjects.Arc>; // 現在存在しているサーバの爆風
  private bombToCreateQueue!: GameQueue<ServerBomb>;
  private blockToRemoveQueue!: GameQueue<ServerBlock>;
  private itemToRemoveQueue!: GameQueue<ServerItem>;

  private bgm!: Phaser.Sound.BaseSound;
  private startBgm!: Phaser.Sound.BaseSound;
  private title!: Phaser.GameObjects.Container;
  private upTitle!: Phaser.GameObjects.Image;
  private downTitle!: Phaser.GameObjects.Image;
  private gameResult?: GameResult;
  private seItemGet!: Phaser.Sound.BaseSound;
  private readonly juice: phaserJuice;
  private IsFinishedDropWallsEvent: boolean = false;

  constructor() {
    super(Config.SCENE_NAME_GAME);
    // eslint-disable-next-line new-cap
    this.juice = new phaserJuice(this);
  }

  init() {
    // ゲームで使用する Map、Queue の初期化
    this.bombToCreateQueue = new GameQueue<ServerBomb>();
    this.blockToRemoveQueue = new GameQueue<ServerBlock>();
    this.itemToRemoveQueue = new GameQueue<ServerItem>();
    this.currItems = new Map();
    this.currBombs = new Map();
    this.currBlasts = new Map();
    this.otherPlayers = new Map();

    this.cursorKeys = initializeKeys(this);
    disableKeys(this.cursorKeys);

    this.startBgm = this.sound.add('battleStart', { volume: Config.SOUND_VOLUME });
    this.startBgm.play();
    this.bgm = this.sound.add('stage_2', {
      volume: Config.SOUND_VOLUME,
    });
    this.seItemGet = this.sound.add('getItem', {
      volume: Config.SOUND_VOLUME * 1.5,
    });

    this.upTitle = this.add.image(0, Constants.HEIGHT / 2, Config.ASSET_KEY_BATTLE_START_UP);
    this.downTitle = this.add.image(
      Constants.WIDTH,
      Constants.HEIGHT / 2 + 42,
      Config.ASSET_KEY_BATTLE_START_DOWN
    );

    this.tweens.add({
      targets: this.upTitle,
      x: Constants.WIDTH / 2,
      duration: 300,
    });
    this.tweens.add({
      targets: this.downTitle,
      x: Constants.WIDTH / 2,
      duration: 300,
    });

    this.title = this.add.container(0, 0, [this.upTitle, this.downTitle]).setDepth(Infinity);
  }

  create(data: { network: Network; serverTimer: ServerTimer }) {
    if (data.network == null) return;
    this.network = data.network;
    if (this.network.room == null) return;
    this.room = this.network.room;
    this.serverTimer = data.serverTimer;

    // プレイヤーをゲームに追加
    this.addPlayers();
    // Colyseus のイベントを追加
    this.initNetworkEvents();

    // TODO: Preloader（Lobby）で読み込んで Game Scene に渡す
    this.room.onStateChange.once((state) => {
      const mapTiles = state.gameMap.mapTiles;
      this.rows = state.gameMap.rows;
      this.cols = state.gameMap.cols;

      drawGround(this, mapTiles.GROUND_IDX); // draw ground
      drawWalls(this, mapTiles); // draw walls
      this.currBlocks = drawBlocks(this, state.blocks); // draw blocks
    });

    // 演出が終わったらゲームを開始
    gameEvents.on(Event.GAME_PREPARING_COMPLETED, () => this.handleGamePreparingCompleted());
  }

  update(time: number, delta: number) {
    if (this.myPlayer === undefined) return;

    this.timeEventHandler();

    // 前回の処理からの経過時間を算出し、1フレームの経過時間を超えていたら処理を実行する
    // https://learn.colyseus.io/phaser/4-fixed-tickrate.html
    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick();
    }
  }

  private timeEventHandler() {
    // 壁落下イベント
    if (this.serverTimer === undefined || this.network === undefined) return;
    if (
      this.serverTimer.finishedAt - this.network.now() <=
      Constants.INGAME_EVENT_DROP_WALLS_TIME
    ) {
      if (!this.IsFinishedDropWallsEvent) dropWalls();
      this.IsFinishedDropWallsEvent = true;
    }
  }

  private fixedTick() {
    this.moveOwnPlayer();
    this.moveOtherPlayers();
    this.placeObjectFromQueue(this.bombToCreateQueue, (v: PlacementObjectInterface) =>
      createBomb(v)
    );
    this.removeObjectFromQueue(this.blockToRemoveQueue, (v: ServerBlock) => removeBlock(v));
    this.removeObjectFromQueue(this.itemToRemoveQueue, (v: ServerItem) => removeItem(v));
    this.updateBombCollision();
  }

  private initNetworkEvents() {
    this.network.onPlayerJoinedRoom(this.handlePlayerJoinedRoom, this); // reconnectを導入する場合必要 (CPU が遅れて参加した場合)
    this.network.onGameStateUpdated(this.handleGameStateChanged, this); // gameStateの変更イベント
    this.network.onGameResultUpdated(this.handleGameResultUpdated, this); // ゲーム結果の変更イベント
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

  private handleGamePreparingCompleted() {
    this.tweens.add({
      targets: this.upTitle,
      x: -Constants.WIDTH,
      duration: 300,
      ease: Phaser.Math.Easing.Quadratic.In,
    });
    this.tweens.add({
      targets: this.downTitle,
      x: Constants.WIDTH * 2,
      duration: 300,
      ease: Phaser.Math.Easing.Quadratic.In,
    });

    this.juice.fadeOut(this.title);

    // キー入力を有効化
    enableKeys(this.cursorKeys);

    // BGM を再生
    this.bgm.play({
      loop: true,
    });
  }

  private addPlayers() {
    this.room.state.players.forEach((player: ServerPlayer, sessionId) => {
      if (sessionId === this.network.mySessionId) {
        this.addMyPlayer(); // 自分を追加
      } else if (player.isCPU) {
        this.addEnemyPlayer(player, sessionId); // CPU を追加
      } else {
        this.addOtherPlayer(player, sessionId); // 他のプレイヤーを追加
      }
    });
  }

  private addMyPlayer() {
    const player = this.room.state.players.get(this.network.mySessionId);
    if (player === undefined) return;
    const myPlayer = this.add.myPlayer(
      this.network.mySessionId,
      player.x,
      player.y,
      player.character,
      undefined,
      player.name
    );
    this.myPlayer = myPlayer;
    player.onChange = () => {
      this.myPlayer.handleServerChange(player);
    };
  }

  private addOtherPlayer(player: ServerPlayer, sessionId: string) {
    const otherPlayer = this.add.otherPlayer(
      sessionId,
      player.x,
      player.y,
      player.character,
      undefined,
      player.name
    );
    this.otherPlayers.set(sessionId, otherPlayer);

    player.onChange = () => {
      otherPlayer.handleServerChange(player);
    };
  }

  private addEnemyPlayer(player: ServerPlayer, sessionId: string) {
    const enemyPlayer = this.add.enemyPlayer(
      sessionId,
      player.x,
      player.y,
      player.character,
      undefined,
      player.name
    );
    this.otherPlayers.set(sessionId, enemyPlayer);

    player.onChange = () => {
      enemyPlayer.handleServerChange(player);
    };
  }

  private handlePlayerJoinedRoom(player: ServerPlayer, sessionId: string) {
    // ping によって CPU が遅れて参加した場合描画されてなかったため
    if (player.isCPU) this.addEnemyPlayer(player, sessionId);
    else this.addOtherPlayer(player, sessionId);
  }

  private handlePlayerLeftRoom(player: ServerPlayer, sessionId: string) {
    const otherPlayer = this.otherPlayers.get(sessionId);
    // 死んだ時にタブを閉じられると、player が undefined になってエラーになるので、見えなくするだけにする
    otherPlayer?.nameLabel.destroy();
    otherPlayer?.setVisible(false);
  }

  private async handleGameStateChanged(data: any) {
    const state = data[0].value as Constants.GAME_STATE_TYPE;

    if (state === Constants.GAME_STATE.FINISHED && this.room !== undefined) {
      // ゲームシーン停止の処理
      this.startBgm.stop();
      this.bgm?.stop();
      this.scene.sendToBack();
      this.scene.stop(Config.SCENE_NAME_GAME_HEADER);

      // 部屋退出の処理
      this.network.removeAllEventListeners();
      await this.network.leaveRoom();
      this.network.getTs().destroy();

      const moveToResultScene = () => {
        this.scene.stop();
        this.scene.run(Config.SCENE_NAME_GAME_RESULT, {
          network: this.network,
          playerName: this.myPlayer.name,
          sessionId: this.room.sessionId,
          gameResult: this.gameResult,
        });
      };

      // 勝利者がいる場合は、勝利者の位置にカメラを移動
      const winner = getWinner(this.gameResult);
      if (winner !== undefined) {
        const camera = this.cameras.main;
        camera.setZoom(1);
        camera.pan(winner.x, winner.y, 2000, 'Sine.easeInOut');
        camera.zoomTo(2, 2000, 'Sine.easeInOut', true);
        camera.once('camerazoomcomplete', moveToResultScene);
      } else {
        moveToResultScene();
      }
    }
  }

  private handleGameResultUpdated(result: GameResult) {
    this.gameResult = result;
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

  // ボム削除イベント時に、マップにボムを追加
  private handleBombRemoved(serverBomb: ServerBomb) {
    if (Config.DEBUG_IS_SHOW_SERVER_BOMB) {
      const body = this.currBombs.get(serverBomb.id);
      if (body === undefined) return;
      this.currBombs.delete(serverBomb.id);
      body.destroy();
    }
  }

  // 破壊予定のブロックをキューに入れる
  private handleBlocksRemoved(serverBlock: ServerBlock) {
    const blockBody = this.currBlocks?.get(serverBlock.id);
    if (blockBody === undefined) return;
    this.blockToRemoveQueue.enqueue(serverBlock);
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

  // 破壊予定のアイテムをキューに入れる
  private handleItemRemoved(serverItem: ServerItem) {
    const itemBody = this.currItems?.get(serverItem.id);
    if (itemBody === undefined) return;
    this.itemToRemoveQueue.enqueue(serverItem);
  }

  // キューに溜まっているオブジェクトをマップに追加する
  private placeObjectFromQueue(queue: GameQueue<PlacementObjectInterface>, callback: Function) {
    if (queue.isEmpty()) return;

    const data = queue.read();
    if (data === undefined) return;
    if (data.createdAt <= this.network.now()) {
      callback(data);
      queue.dequeue();
    }
  }

  // キューに溜まっているオブジェクトをマップから削除する
  private removeObjectFromQueue(queue: GameQueue<PlacementObjectInterface>, callback: Function) {
    if (queue.isEmpty()) return;

    const data = queue.read();
    if (data === undefined) return;
    if (data.removedAt <= this.network.now()) {
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
    this.otherPlayers.forEach((otherPlayer: OtherPlayer | EnemyPlayer) => {
      otherPlayer.update();
    });
  }

  public getCurrentPlayer(): MyPlayer {
    return this.myPlayer;
  }

  public getOtherPlayers(): Map<string, OtherPlayer | EnemyPlayer> {
    return this.otherPlayers;
  }

  public getCols(): number {
    return this.cols;
  }

  public getRows(): number {
    return this.rows;
  }

  public getNetwork(): Network {
    return this.network;
  }

  public getJuice(): phaserJuice {
    return this.juice;
  }

  public getCurrBlocks(): Map<string, Block> | undefined {
    return this.currBlocks;
  }

  public getCurrItems(): Map<string, Item> | undefined {
    return this.currItems;
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

  public getSeItemGet(): Phaser.Sound.BaseSound {
    return this.seItemGet;
  }
}
