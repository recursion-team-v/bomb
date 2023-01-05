import { ArraySchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';
import MapTiles from './MapTiles';

export default class Map extends Schema {
  @type(['number'])
  blockArr: number[]; // 箱（破壊可能）

  @type(MapTiles)
  mapTiles = new MapTiles();

  constructor() {
    super();
    this.blockArr = this.generateBlockArr();
  }

  private generateBlockArr() {
    const rows = Constants.TILE_ROWS;
    const cols = Constants.TILE_COLS;
    const arr = new Array<number>(rows * cols).fill(-1);
    const yMin = 1;
    const yMax = rows - 2;
    const xMin = 1;
    const xMax = cols - 2;

    const blockPlacements: number[][] = [];
    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        if (!(y % 2 === 0 && x % 2 === 0)) {
          blockPlacements.push([x, y]);
        }
      }
    }

    blockPlacements.sort(() => Math.random() - 0.5);

    let maxBlocks = Constants.MAX_BLOCKS;
    for (const coords of blockPlacements) {
      if (maxBlocks <= 0) break;
      const x = coords[0];
      const y = coords[1];
      arr[x + cols * y] = Constants.TILE_BLOCK_IDX;
      maxBlocks--;
    }

    // プレイヤーが最低限移動できる位置にはブロックを配置しない
    for (const x of [xMin, xMin + 1, xMax - 1, xMax]) {
      for (const y of [yMin, yMin + 1, yMax - 1, yMax]) {
        arr[x + cols * y] = -1;
      }
    }

    return new ArraySchema<number>(...arr);
  }
}
