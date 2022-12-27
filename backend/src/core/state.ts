import { MapSchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../../constants/constants';
import * as Config from '../config/config';
import Player from './player';

export default class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type('number')
  gameState = Constants.GAME_STATE.WAITING;

  move(sessionId: string, x: number, y: number) {
    const p = this.players.get(sessionId) as Player;
    p.x = x;
    p.y = y;
  }

  isRoomFull(): boolean {
    return this.players.size >= Config.MAX_PLAYER;
  }

  getPlayersCount() {
    return this.players.size;
  }

  setPlayer(sessionId: string, x: number, y: number) {
    const player = this.players.get(sessionId) as Player;
    player.x = x;
    player.y = y;
  }

  getPlayer(sessionId: string): Player {
    const player = this.players.get(sessionId);
    if (player === undefined) {
      throw new Error(`player(${sessionId}) is undefined`);
    }

    return player;
  }

  createPlayer(sessionId: string): Player {
    const player = new Player(this.getPlayersCount());
    this.players.set(sessionId, player);
    return player;
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }
}
