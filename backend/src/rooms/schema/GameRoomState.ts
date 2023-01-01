import { MapSchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';
import Player from './Player';

export default class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  getPlayer(sessionId: string): Player | undefined {
    return this.players.get(sessionId);
  }

  getPlayersCount() {
    return this.players.size;
  }

  createPlayer(sessionId: string): Player {
    const player = new Player(sessionId, this.getPlayersCount());
    const idx = this.getPlayersCount();
    player.idx = idx;
    player.x = Constants.INITIAL_PLAYER_POSITION[idx].x;
    player.y = Constants.INITIAL_PLAYER_POSITION[idx].y;
    this.players.set(sessionId, player);
    return player;
  }
}
