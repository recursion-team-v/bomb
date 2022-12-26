/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Client, Room } from 'colyseus';
import { Schema, type } from '@colyseus/schema';
import * as Constants from '../../../constants/constants';
import * as Config from '../config/config';
import Player from './player';
import State from './state';

class test extends Schema {
  @type('number')
  private readonly a: number;

  @type('number')
  private readonly b: number;

  constructor(a: number, b: number) {
    super();
    this.a = a;
    this.b = b;
  }
}

export class GameRoom extends Room {
  private sessionIds: string[] = [];

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
        this.state.move(client.sessionId, clientPlayer.x, clientPlayer.y);
        // const player: Player = this.state.players.get(client.sessionId);

        // player.x = clientPlayer.x;
        // player.y = clientPlayer.y;
        // TODO: クライアントでチートされてないかチェックする

        // this.state.players.set(client.sessionId, player);
        // const t = new test(1, 2);
        // this.broadcast(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, { Player: t });
        // console.log(this.state.players);
      }
    );

    // // フレームごとにゲームの状態を送信する
    // setInterval(() => {
    //   this.broadcast(Constants.NOTIFICATION_TYPE.GAME_PROGRESS, {
    //     gameState: this.state.gameState,
    //   });
    // }, Config.FRAME_RATE);
  }

  // Called every time a client joins
  onJoin(client: Client, options: any) {
    if (this.sessionIds.length >= Config.MAX_PLAYER) {
      throw new Error('Room is full.');
    }

    if (this.state.gameState !== Constants.GAME_STATE.WAITING) {
      throw new Error('Game is already started.');
    }

    const playerCount = this.sessionIds.length;
    const player = new Player(playerCount);
    const sessionId = client.sessionId;

    this.sessionIds.push(sessionId);
    this.state.players.set(sessionId, player);

    this.broadcast(`${sessionId} joined.`);
    client.send(Constants.NOTIFICATION_TYPE.PLAYER_INFO, {
      x: player.x,
      y: player.y,
      speed: player.speed,
      bombStrength: player.bombStrength,
      bombNum: player.bombNum,
    });
  }

  onLeave(client: Client, consented: boolean) {
    client.leave();
    console.log(client.id, 'left');
    this.broadcast(`${client.sessionId} left.`);
    this.sessionIds = this.sessionIds.filter((id) => id !== client.sessionId);
  }
}
