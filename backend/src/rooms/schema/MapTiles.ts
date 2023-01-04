import { Schema, type } from '@colyseus/schema';
import * as Constants from '../../constants/constants';

export default class MapTiles extends Schema {
  @type('number')
  OUTER_WALL_TOP_BOT: number;

  @type('number')
  OUTER_WALL_LEFT_RIGHT: number;

  @type('number')
  OUTER_WALL_CORNER: number;

  @type('number')
  INNER_WALL: number;

  @type('number')
  GROUND_IDX: number;

  constructor() {
    super();
    this.OUTER_WALL_TOP_BOT =
      Constants.TILE_WALL.OUTER_TOP_BOT[
        Math.floor(Math.random() * Constants.TILE_WALL.OUTER_TOP_BOT.length)
      ];
    this.OUTER_WALL_LEFT_RIGHT =
      Constants.TILE_WALL.OUTER_LEFT_RIGHT[
        Math.floor(Math.random() * Constants.TILE_WALL.OUTER_LEFT_RIGHT.length)
      ];
    this.OUTER_WALL_CORNER =
      Constants.TILE_WALL.OUTER_CORNER[
        Math.floor(Math.random() * Constants.TILE_WALL.OUTER_CORNER.length)
      ];
    this.INNER_WALL =
      Constants.TILE_WALL.INNER[Math.floor(Math.random() * Constants.TILE_WALL.INNER.length)];
    this.GROUND_IDX = Math.floor(Math.random() * 3);
  }
}
