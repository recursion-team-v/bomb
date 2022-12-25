/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Client, Room } from 'colyseus';
import { Player } from './player';
import { Schema, MapSchema, type } from '@colyseus/schema';
import * as Constants from '../../../constants/constants';
import * as Config from '../config/config';

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type('number')
  gameState = Constants.GAME_STATE.WAITING;
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
    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, (client, clientPlayer: Player) => {
      const player = this.state.players.get(client.sessionId);

      // TODO: クライアントでチートされてないかチェックする
      if (clientPlayer.moveToLeft) player.x -= player.speed;
      if (clientPlayer.moveToRight) player.x += player.speed;
      if (clientPlayer.moveToUp) player.y -= player.speed;
      if (clientPlayer.moveToDown) player.y += player.speed;

      console.log('player move !');
      this.broadcast(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, {
        sessionId: client.sessionId,
        x: player.x,
        y: player.y,
      });
    });
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
    console.log(client.id, 'left');
    this.broadcast(`${client.sessionId} left.`);
    this.sessionIds = this.sessionIds.filter((id) => id !== client.sessionId);
  }
}
