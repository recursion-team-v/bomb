/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Client, Room } from 'colyseus';
import * as Constants from '../constants/constants';
import GameRoomState from './schema/GameRoomState';

export default class GameRoom extends Room<GameRoomState> {
  onCreate(options: any) {
    this.setState(new GameRoomState());

    this.onMessage('move', (client, data) => {
      this.state.updatePlayer(client.sessionId, data);
    });

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
        this.fixedUpdate(Constants.FRAME_RATE);
      }
    });
  }

  // キューに詰められた入力を処理し、キャラの移動を行う
  // TODO: 当たり判定
  private fixedUpdate(deltaTime: number) {
    this.state.players.forEach((player) => {
      const velocity = player.speed;
      let data: any;

      while ((data = player.inputQueue.shift())) {
        if (data.left) {
          player.x -= velocity;
        } else if (data.right) {
          player.x += velocity;
        }

        if (data.up) {
          player.y -= velocity;
        } else if (data.down) {
          player.y += velocity;
        }
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');

    // create Player instance
    this.state.createPlayer(client.sessionId);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }
}
