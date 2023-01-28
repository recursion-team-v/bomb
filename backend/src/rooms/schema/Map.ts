import { ArraySchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';

export default class Map extends Schema {
  @type('number')
  rows: number;

  @type('number')
  cols: number;

  @type(['number'])
  blockArr: number[]; // 箱（破壊可能）

  constructor() {
    super();
    this.rows = Constants.TILE_ROWS;
    this.cols = Constants.TILE_COLS;
    this.blockArr = this.generateBlockArr();
  }

  private generateBlockArr() {
    const arr = new Array<number>(this.rows * this.cols).fill(-1);
    const yMin = 1;
    const yMax = this.rows - 2;
    const xMin = 1;
    const xMax = this.cols - 2;

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
      arr[x + this.cols * y] = Constants.TILE_BLOCK_IDX;
      maxBlocks--;
    }

    // プレイヤーが最低限移動できる位置にはブロックを配置しない
    for (const x of [xMin, xMin + 1, xMax - 1, xMax]) {
      for (const y of [yMin, yMin + 1, yMax - 1, yMax]) {
        arr[x + this.cols * y] = -1;
      }
    }

    return new ArraySchema<number>(...arr);
  }
}
