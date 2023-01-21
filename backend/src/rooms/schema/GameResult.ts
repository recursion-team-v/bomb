import { Schema, type } from '@colyseus/schema';
import * as Constants from '../../constants/constants';
import Player from './Player';

// ゲームの結果を表すクラス
export default class GameResult extends Schema {
  @type(Player)
  winner: Player | undefined;

  @type([Player])
  players: Player[];

  @type('number')
  result: Constants.GAME_RESULT_TYPE;

  constructor(winner: Player | undefined, players: Player[], result: Constants.GAME_RESULT_TYPE) {
    super();
    this.winner = winner;
    this.players = players;
    this.result = result;
  }
}
