import { MapSchema, Schema, type } from '@colyseus/schema';
import Player from './Player';
import * as Config from '../../config/config';
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
    player.x = Config.INITIAL_PLAYER_POSITION[idx].x;
    player.y = Config.INITIAL_PLAYER_POSITION[idx].y;
    this.players.set(sessionId, player);
    return player;
  }
}
