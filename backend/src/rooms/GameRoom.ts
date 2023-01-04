/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Client, Room } from 'colyseus';
import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import GameEngine from './GameEngine';
import GameRoomState from './schema/GameRoomState';

export default class GameRoom extends Room<GameRoomState> {
  engine!: GameEngine;

  onCreate(options: any) {
    this.setState(new GameRoomState());

    this.engine = new GameEngine(this.state);

    // ゲーム開始をクライアントから受け取る
    this.onMessage(Constants.NOTIFICATION_TYPE.GAME_PROGRESS, () => this.gameStartEvent());

    // クライアントからの移動入力を受け取ってキューに詰める
    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, (client, data: any) => {
      // get reference to the player who sent the message
      const player = this.state.getPlayer(client.sessionId);
      if (player === undefined) return;

      player.inputQueue.push(data);
    });

    // TODO:クライアントからのボム設置入力を受け取ってキューに詰める
    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_BOMB, (client) =>
      this.addBombEvent(client.sessionId)
    );

    // FRAME_RATE ごとに fixedUpdate を呼ぶ
    let elapsedTime: number = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= Constants.FRAME_RATE) {
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

        // 爆弾の処理
        this.bombProcess();

        Matter.Engine.update(this.engine.engine, deltaTime);
      }
    });
  }

  // ゲーム開始イベント
  private gameStartEvent() {
    try {
      this.state.gameState.setPlaying();
      this.state.setTimer();
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
    console.log(client.sessionId, 'left!');
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }

  /*
  イベント関連
  */

  // 爆弾追加のイべント
  private addBombEvent(sessionId: string) {
    const player = this.state.getPlayer(sessionId);
    if (player === undefined) return;

    const bomb = this.engine.playerService.placeBomb(player); // ボムを設置する  TODO:
    if (bomb !== null) this.state.getBombQueue().enqueue(bomb); // ボムキューに詰める
  }

  /*
  フレームごとの処理関連
  */

  // 爆弾の処理
  private bombProcess() {
    // ボムキューに詰められたボムを処理する
    while (!this.state.getBombQueue().isEmpty()) {
      const bomb = this.state.getBombQueue().read();

      // ボムが爆発していない場合は処理を終了する
      if (bomb === undefined || !bomb.isExploded()) break;

      // ボムを爆発して、削除する
      this.state.getBombQueue().dequeue();
      this.engine.bombService.explode(bomb);
      this.state.deleteBomb(bomb);

      // TODO: 爆風の処理
    }
  }
}
