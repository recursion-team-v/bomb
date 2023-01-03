import { MapSchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';
import Timer from './Timer';
import Player from './Player';
import Map from './Map';

export default class GameRoomState extends Schema {
  @type('number')
  private gameState: number = Constants.GAME_STATE.WAITING;

  @type(Timer)
  readonly timer = new Timer();

  @type({ map: Player }) players = new MapSchema<Player>();

  @type(Map) gameMap = new Map();

  getPlayer(sessionId: string): Player | undefined {
    return this.players.get(sessionId);
  }

  getPlayersCount() {
    return this.players.size;
  }

  setTimer() {
    this.timer.set(Date.now());
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

  setGameStatePlaying() {
    if (this.gameState !== Constants.GAME_STATE.WAITING) return;
    this.gameState = Constants.GAME_STATE.PLAYING;
  }

  setGameStateFinished() {
    if (this.gameState !== Constants.GAME_STATE.PLAYING) return;
    this.gameState = Constants.GAME_STATE.FINISHED;
  }
}
