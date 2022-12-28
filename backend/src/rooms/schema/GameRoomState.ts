import { MapSchema, Schema, type } from '@colyseus/schema';
import Player from './Player';

export default class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  updatePlayer(sessionId: string, data: any) {
    const player = this.players.get(sessionId);
    if (player === undefined) return;
    player.x = data.x;
    player.y = data.y;
  }

  getPlayersCount() {
    return this.players.size;
  }

  createPlayer(sessionId: string): Player {
    const player = new Player(this.getPlayersCount());
    this.players.set(sessionId, player);
    return player;
  }
}
