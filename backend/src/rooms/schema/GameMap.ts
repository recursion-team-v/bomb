import { Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';

export default class GameMap extends Schema {
  @type('number')
  rows: number;

  @type('number')
  cols: number;

  numberOfBlocks: number;
  blockArr: number[]; // 箱（破壊可能）

  constructor(row: number, col: number, blockRate: Constants.ROOM_INFO_BLOCK_PLACEMENT_RATES) {
    super();
    this.rows = row;
    this.cols = col;
    this.numberOfBlocks = (row - 2) * (col - 2) * blockRate;
    this.blockArr = [];
  }

  getRows() {
    return this.rows;
  }

  getCols() {
    return this.cols;
  }

  setRows(rows: number) {
    this.rows = rows;
  }

  setCols(cols: number) {
    this.cols = cols;
  }

  generateBlockArr() {
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

    let maxBlocks = this.numberOfBlocks;
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

    this.blockArr = arr;
  }
}
