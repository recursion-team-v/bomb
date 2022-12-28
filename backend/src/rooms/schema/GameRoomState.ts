import { MapSchema, Schema, type } from '@colyseus/schema';
import Player from './Player';

export default class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  updatePlayer(sessionId: string, vx: number, vy: number) {
    const player = this.players.get(sessionId);
    player.vx = vx;
    player.vy = vy;
  }
}
