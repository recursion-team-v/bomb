import { MapSchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';
import Player from './Player';
export default class GameState extends Schema {
  @type('number')
  private gameState: Constants.GAME_STATE_TYPE;

  constructor() {
    super();
    this.gameState = Constants.GAME_STATE.WAITING;
  }

  setWaiting() {
    if (!this.isFinished()) {
      throw new Error('Invalid game state');
    }
    this.gameState = Constants.GAME_STATE.WAITING;
  }

  setPlaying() {
    if (!this.isWaiting()) {
      throw new Error('Invalid game state');
    }
    this.gameState = Constants.GAME_STATE.PLAYING;
  }

  setFinished() {
    if (!this.isPlaying()) {
      throw new Error('Invalid game state');
    }
    this.gameState = Constants.GAME_STATE.FINISHED;
  }

  isWaiting() {
    return this.gameState === Constants.GAME_STATE.WAITING;
  }

  isPlaying() {
    return this.gameState === Constants.GAME_STATE.PLAYING;
  }

  isFinished() {
    return this.gameState === Constants.GAME_STATE.FINISHED;
  }

  // 残りのプレイヤーが0人 or 1人かどうかを返す
  isRemainPlayerZeroOrOne(players: MapSchema<Player, string>) {
    let count = players.size;

    for (const player of players.values()) {
      if (player.isDead()) {
        count--;
      }
    }
    return count <= 1;
  }
}
