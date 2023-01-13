import { Client, Room } from 'colyseus';
import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import GameEngine from './GameEngine';
import { Bomb } from './schema/Bomb';
import Block from './schema/Block';
import GameRoomState from './schema/GameRoomState';
import PlacementObjectInterface from '../interfaces/placement_object';
import GameQueue from '../utils/gameQueue';
import Item from './schema/Item';

export default class GameRoom extends Room<GameRoomState> {
  engine!: GameEngine;

  onCreate(options: any) {
    // ルームで使用する時計
    this.clock.start();

    this.setState(new GameRoomState());
    this.engine = new GameEngine(this);

    // ゲーム開始をクライアントから受け取る
    this.onMessage(Constants.NOTIFICATION_TYPE.GAME_PROGRESS, () => this.gameStartEvent());

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
      if (player.isDead()) return;
      if (!player.canSetBomb()) return;

      this.state
        .getBombToCreateQueue()
        .enqueue(this.state.createBomb(player, player.x, player.y, player.bombStrength));
    });

    // FRAME_RATE ごとに fixedUpdate を呼ぶ
    let elapsedTime: number = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      this.state.timer.updateNow();

      while (elapsedTime >= Constants.FRAME_RATE) {
        this.state.timer.updateNow();

        // 時間切れになったらゲーム終了
        if (!this.state.timer.isInTime() && this.state.gameState.isPlaying()) {
          try {
            this.state.gameState.setFinished();
          } catch (e) {
            console.error(e);
          }
          return;
        }

        // 残り時間の更新
        this.state.timer.setRemainTime();

        elapsedTime -= Constants.FRAME_RATE;

        for (const [, player] of this.state.players) {
          this.engine.playerService.updatePlayer(player);
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

  // ゲーム開始イベント
  private gameStartEvent() {
    try {
      this.state.gameState.setPlaying();
      this.state.setTimer();

      // ゲームの開始と終了時間を送信
      this.broadcast(Constants.NOTIFICATION_TYPE.GAME_START_INFO, {
        startedAt: this.state.timer.startedAt,
        finishedAt: this.state.timer.finishedAt,
      });
    } catch (e) {
      console.error(e);
    }
  }

  // キューに詰められた入力を処理し、キャラの移動を行う
  // TODO: 当たり判定
  // private fixedUpdate(deltaTime: number) {
  //   this.state.players.forEach((player) => {
  //     this.engine?.updatePlayer(player, deltaTime);
  //   });
  // }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');

    // create Player instance and add to matter
    this.engine.playerService.addPlayer(client.sessionId);
  }

  onLeave(client: Client, consented: boolean) {
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
    if (isPlaced) this.state.getBombToExplodeQueue().enqueue(bomb); // 爆破用のボムキューに詰める
  }

  // 爆弾削除のイべント
  private removeBombEvent(b: PlacementObjectInterface) {
    const bomb = b as Bomb;
    this.engine.bombService.explode(bomb);
  }

  // ブロック削除のイべント
  private removeBlockEvent(b: PlacementObjectInterface) {
    const block = b as Block;
    this.state.getBombToExplodeQueue().dequeue();
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
}
