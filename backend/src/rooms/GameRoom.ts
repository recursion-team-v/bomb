/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Client, Room } from 'colyseus';
import Matter from 'matter-js';
import * as Constants from '../constants/constants';
import { GameEngine } from './GameEngine';
import GameRoomState from './schema/GameRoomState';

export default class GameRoom extends Room<GameRoomState> {
  engine!: GameEngine;

  onCreate(options: any) {
    this.setState(new GameRoomState());

    this.engine = new GameEngine(this.state);

    // クライアントからの移動入力を受け取ってキューに詰める
    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, (client, data: any) => {
      // get reference to the player who sent the message
      const player = this.state.getPlayer(client.sessionId);
      if (player === undefined) return;

      player.inputQueue.push(data);
    });

    // FRAME_RATE ごとに fixedUpdate を呼ぶ
    let elapsedTime: number = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= Constants.FRAME_RATE) {
        elapsedTime -= Constants.FRAME_RATE;
        for (const [, player] of this.state.players) {
          this.engine.updatePlayer(player);
        }
        Matter.Engine.update(this.engine.engine, deltaTime);
      }
    });
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
    this.engine.addPlayer(client.sessionId);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }
}
