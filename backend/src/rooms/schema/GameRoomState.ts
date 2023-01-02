import { MapSchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';
import GameQueue from '../../utils/gameQueue';
import { Bomb, getSettablePosition } from './Bomb';
import Player from './Player';

export default class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Bomb }) bombs = new MapSchema<Bomb>();
  private readonly bombQueue: GameQueue = new GameQueue();

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

  createBomb(player: Player, x: number, y: number, bombStrength: number): Bomb {
    const { bx, by } = getSettablePosition(player.x, player.y);
    const bomb = new Bomb(player, bx, by, bombStrength);
    this.bombs.set(bomb.id, bomb);
    return bomb;
  }

  getBombQueue(): GameQueue {
    return this.bombQueue;
  }
}
