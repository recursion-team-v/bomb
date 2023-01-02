import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';
import Player from './Player';

export default class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  @type(['number']) mapArr: number[];

  constructor() {
    super();
    this.mapArr = new ArraySchema<number>(
      ...this.generateMapArr(Constants.TILE_ROWS, Constants.TILE_COLS)
    );
  }

  generateMapArr(rows: number, cols: number) {
    const arr = new Array<number>(rows * cols).fill(-1);
    let crateCnt = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const rand = Math.random() * 10;
        if (x === 0 || x === cols - 1) {
          arr[x + cols * y] = Constants.TILE_WALL.DEFAULT_1_IDX;
        } else if (y === 0 || y === rows - 1) {
          arr[x + cols * y] = Constants.TILE_WALL.DEFAULT_2_IDX;
        } else if (x % 2 === 0 && y % 2 === 0) {
          arr[x + cols * y] = Constants.TILE_WALL.DEFAULT_2_IDX;
        } else if (crateCnt < 10 && rand < 1 && x > 1 && y > 1 && x < cols - 2 && y < rows - 2) {
          crateCnt++;
          arr[x + cols * y] = Constants.TILE_CRATE_IDX;
        }
      }
    }

    arr[0] = Constants.TILE_WALL.DEFAULT_CORNER_IDX;
    arr[cols - 1] = Constants.TILE_WALL.DEFAULT_CORNER_IDX;
    arr[cols * (rows - 1)] = Constants.TILE_WALL.DEFAULT_CORNER_IDX;
    arr[rows * cols - 1] = Constants.TILE_WALL.DEFAULT_CORNER_IDX;
    return arr;
  }

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
