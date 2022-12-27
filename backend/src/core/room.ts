/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Client, Room } from 'colyseus';

import * as Constants from '../../../constants/constants';
import * as Config from '../config/config';
import Player from './player';
import State from './state';

export class GameRoom extends Room {
  onCreate(options: any) {
    this.maxClients = Config.MAX_PLAYER;

    // initialize empty room state
    this.setState(new State());

    this.onMessage(Constants.NOTIFICATION_TYPE.GAME_PROGRESS, () => {
      if (this.state.gameState !== Constants.GAME_STATE.WAITING) {
        return;
      }

      console.log('start game !');
      this.state.state = Constants.GAME_STATE.PLAYING;
      this.broadcast(Constants.NOTIFICATION_TYPE.GAME_PROGRESS, {
        gameState: this.state.gameState,
      });
    });

    // Called every time this room receives a "move" message
    this.onMessage(
      Constants.NOTIFICATION_TYPE.PLAYER_MOVE,
      (client: Client, clientPlayer: Player) => {
        this.state.setPlayer(client.sessionId, clientPlayer.x, clientPlayer.y);

        // TODO: クライアントでチートされてないかチェックする

        // this.broadcast(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, { Player: t });
        // console.log(this.state.players);
      }
    );

    // フレームごとにゲームの状態を送信する
    // setInterval(() => {
    //   this.broadcast(Constants.NOTIFICATION_TYPE.GAME_PROGRESS, {
    //     gameState: this.state.gameState,
    //   });
    // }, Config.FRAME_RATE);
  }

  // Called every time a client joins
  onJoin(client: Client) {
    if (this.state.isRoomFull() === true) {
      throw new Error('Room is full.');
    }

    if (this.state.gameState !== Constants.GAME_STATE.WAITING) {
      throw new Error('Game is already started.');
    }

    const sessionId = client.sessionId;
    const player = this.state.createPlayer(sessionId);

    client.send(Constants.NOTIFICATION_TYPE.PLAYER_INFO, {
      x: player.x,
      y: player.y,
      speed: player.speed,
      bombStrength: player.bombStrength,
      bombNum: player.bombNum,
    });
  }

  onLeave(client: Client, consented: boolean) {
    this.state.removePlayer(client.sessionId);
    client.leave();
    console.log(client.id, 'left');
  }
}
