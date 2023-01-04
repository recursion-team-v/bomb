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

    const maxBlocks = Math.floor(
      Math.random() * (Constants.MAX_BLOCKS - Constants.MIN_BLOCKS + 1) + Constants.MIN_BLOCKS
    );
    let blockCnt = 0;

    while (blockCnt < maxBlocks) {
      const y = Math.floor(Math.random() * (yMax - yMin + 1) + yMin);
      const x = Math.floor(Math.random() * (xMax - xMin + 1) + xMin);

      const blockCondition =
        !(y % 2 === 0 && x % 2 === 0) && arr[x + cols * y] !== Constants.TILE_BLOCK_IDX;

      if (blockCondition) {
        arr[x + cols * y] = Constants.TILE_BLOCK_IDX;
        blockCnt++;
      }
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
