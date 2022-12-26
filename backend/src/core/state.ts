import { MapSchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../../constants/constants';
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
}
