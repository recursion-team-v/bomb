import { Client, Room } from 'colyseus';
import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import dropWalls from '../game_engine/services/dropWallService';
import PlacementObjectInterface from '../interfaces/placement_object';
import GameQueue from '../utils/gameQueue';
import GameEngine from './GameEngine';
import Block from './schema/Block';
import { Bomb } from './schema/Bomb';
import Enemy from './schema/Enemy';
import GameRoomState from './schema/GameRoomState';
import Item from './schema/Item';

export default class GameRoom extends Room<GameRoomState> {
  engine!: GameEngine;
  private name?: string;
  private IsFinishedDropWallsEvent: boolean = false;
  private readonly enemies = new Map<string, Enemy>();

  async onCreate(options: any) {
    const { autoDispose, playerName } = options;
    this.name = playerName;
    this.maxClients = Constants.MAX_PLAYER;
    this.autoDispose = autoDispose;
    await this.setMetadata({ name: this.name, locked: false });

    // ルームで使用する時計
    this.clock.start();

    this.setState(new GameRoomState());
    this.engine = new GameEngine(this);

    // ゲーム開始の準備完了をクライアントから受け取る
    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_IS_READY, (client, data) => {
      if (this.state.gameState.isPlaying()) return;

      console.log(data);
      const myPlayer = this.state.getPlayer(client.sessionId);
      if (myPlayer === undefined) return;
      myPlayer.setIsReady();
      this.broadcast(Constants.NOTIFICATION_TYPE.PLAYER_IS_READY, client.sessionId);

      let isLobbyReady = true;
      this.state.players.forEach((player) => (isLobbyReady = isLobbyReady && player.isReady()));
      if (isLobbyReady) {
        // Matter エンジンにマップ・プレイヤー・CPU を追加する
        this.engine = new GameEngine(this);
        this.engine.addMapToWorld(Constants.TILE_ROWS, Constants.TILE_COLS);
        this.state.players.forEach((player) => {
          this.engine.addPlayerToWorld(player.sessionId);
        });
        this.broadcast(Constants.NOTIFICATION_TYPE.GAME_DATA, {
          blocks: this.state.blocks,
          mapRows: this.state.gameMap.rows,
          mapCols: this.state.gameMap.cols,
        });
        this.lockRoom().catch((err) => console.log(err));
      }
    });

    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_IS_LOADING_COMPLETE, (client) => {
      console.log('LOADING COMPLETE');
      const myPlayer = this.state.getPlayer(client.sessionId);
      if (myPlayer === undefined) return;
      myPlayer.setIsLoadingComplete();

      let isLobbyLoadingComplete = true;
      this.state.players.forEach((player) => {
        isLobbyLoadingComplete = isLobbyLoadingComplete && player.isLoadingComplete();
      });
      if (isLobbyLoadingComplete) {
        this.addEnemy();
        this.startGame();
      }
    });

    // クライアントからの移動入力を受け取ってキューに詰める
    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, (client, data: any) => {
      // get reference to the player who sent the message
      const player = this.state.getPlayer(client.sessionId);
      if (player === undefined) return;

      // 既に死んでいたら無視
      if (player.isDead()) return;

      player.inputQueue.push(data);
    });

    // TODO:クライアントからのボム設置入力を受け取ってキューに詰める
    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_BOMB, (client) => {
      // キューに詰める
      const player = this.state.getPlayer(client.sessionId);
      if (player === undefined) return;
      this.engine.bombService.enqueueBomb(player);
    });

    // ゲーム結果をチェックする
    this.clock.setInterval(() => this.state.setGameResult(), Constants.CHECK_GAME_RESULT_INTERVAL);

    // FRAME_RATE ごとに fixedUpdate を呼ぶ
    let elapsedTime: number = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      this.state.timer.updateNow();
      this.timeEventHandler();
      this.enemyHandler();

      while (elapsedTime >= Constants.FRAME_RATE) {
        this.state.timer.updateNow();

        elapsedTime -= Constants.FRAME_RATE;

        for (const [, player] of this.state.players) {
          if (this.enemies.get(player.sessionId) === undefined) {
            this.engine.playerService.updatePlayer(player);
          } else {
            this.engine.enemyService.updateEnemy(player as Enemy);
          }
        }

        // 爆弾の衝突判定の更新（プレイヤーが降りた場合は判定を変える)
        this.engine.bombService.updateBombCollision();

        // 爆弾の処理
        this.objectCreateHandler(this.state.getBombToCreateQueue(), (bomb) =>
          this.createBombEvent(bomb)
        );
        this.objectRemoveHandler(this.state.getBombToExplodeQueue(), (bomb) =>
          this.removeBombEvent(bomb)
        );

        // ブロックの処理
        this.objectRemoveHandler(this.state.getBlockToDestroyQueue(), (block) =>
          this.removeBlockEvent(block)
        );

        // アイテムの処理
        this.objectRemoveHandler(this.state.getItemToDestroyQueue(), (item) =>
          this.removeItemEvent(item)
        );

        // ゲーム終了判定 TODO: ロビーができて、ちゃんとゲーム開始判定ができたら有効化する
        // if (
        //   this.state.gameState.isPlaying() &&
        //   this.state.gameState.isRemainPlayerZeroOrOne(this.state.players)
        // )
        //   this.state.gameState.setFinished();

        Matter.Engine.update(this.engine.engine, deltaTime);
      }
    });
  }

  private async lockRoom() {
    await this.lock();
    await this.setMetadata({ locked: true });
  }

  // ゲーム開始イベント
  private startGame() {
    if (!this.state.gameState.isPlaying()) {
      const data = {
        serverTimer: this.state.timer,
      };
      this.broadcast(Constants.NOTIFICATION_TYPE.GAME_START_INFO, data);
      this.state.gameState.setPlaying();
      this.state.setTimer();
    }
  }

  // CPU を追加する
  private addEnemy() {
    const enemyCount = Constants.MAX_PLAYER - this.state.getPlayersCount();

    for (let i = 0; i < enemyCount; i++) {
      const enemy = this.engine.enemyService.addEnemy(`enemy-${i}`);
      this.enemies.set(`enemy-${i}`, enemy);
      this.state.enemies.push(enemy);
    }
  }

  // キューに詰められた入力を処理し、キャラの移動を行う
  // TODO: 当たり判定
  // private fixedUpdate(deltaTime: number) {
  //   this.state.players.forEach((player) => {
  //     this.engine?.updatePlayer(player, deltaTime);
  //   });
  // }

  onJoin(client: Client, options: { playerName: string }) {
    console.log(client.sessionId, 'joined!');
    const { playerName } = options;
    this.engine.playerService.addPlayer(client.sessionId, playerName);
  }

  onLeave(client: Client, consented: boolean) {
    const player = this.state.getPlayer(client.sessionId);
    if (player !== undefined) {
      this.state.playerIdxsAvail[player.idx] = true;
    }
    this.engine.playerService.deletePlayer(client.sessionId);
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }

  /*
  イベント関連
  */

  // 爆弾追加のイべント
  private createBombEvent(b: PlacementObjectInterface) {
    const bomb = b as Bomb;
    const isPlaced = this.engine.playerService.placeBomb(bomb); // ボムを設置する
    if (isPlaced) {
      this.state.getBombToExplodeQueue().enqueue(bomb);
    } else {
      this.engine.bombService.deleteBomb(bomb);
    }
  }

  // 爆弾削除のイべント
  private removeBombEvent(b: PlacementObjectInterface) {
    const bomb = b as Bomb;
    this.engine.bombService.explode(bomb);
  }

  // ブロック削除のイべント
  private removeBlockEvent(b: PlacementObjectInterface) {
    const block = b as Block;
    this.engine.mapService.destroyBlock(block);
  }

  // アイテム削除のイべント
  private removeItemEvent(b: PlacementObjectInterface) {
    const item = b as Item;
    this.engine.itemService.removeItem(item);
  }

  /*
  フレームごとの処理関連
  */

  // オブジェクトを設置するための処理
  private objectCreateHandler(
    queue: GameQueue<PlacementObjectInterface>,
    callback: (data: PlacementObjectInterface) => void
  ) {
    // キューに詰められたオブジェクトを処理する
    while (!queue.isEmpty()) {
      const data = queue.read();

      // 設置タイミングになってない場合は処理を終了する
      if (data === undefined || !data.isCreatedTime()) break;

      // 設置処理を行う
      callback(data);
      queue.dequeue();
    }
  }

  // オブジェクトを削除するための処理
  private objectRemoveHandler(
    queue: GameQueue<PlacementObjectInterface>,
    callback: (data: PlacementObjectInterface) => void
  ) {
    // キューに詰められたオブジェクトを処理する
    while (!queue.isEmpty()) {
      const data = queue.read();

      // 破壊タイミングになってない場合は処理を終了する
      if (data === undefined || !data.isRemovedTime()) break;

      // 設置処理を行う
      callback(data);
      queue.dequeue();
    }
  }

  private timeEventHandler() {
    if (!this.state.gameState.isPlaying()) return;

    // 壁落下イベント
    if (this.state.timer.getRemainTime() <= Constants.INGAME_EVENT_DROP_WALLS_TIME) {
      if (!this.IsFinishedDropWallsEvent) {
        dropWalls(this.engine);
      }
      this.IsFinishedDropWallsEvent = true;
    }
  }

  // 敵の移動を行う
  private enemyHandler() {
    if (!this.state.gameState.isPlaying()) return;
    if (!this.state.timer.isOpeningFinished()) return;
    this.engine.enemyService.calcAdjustablePosition();
  }
}
