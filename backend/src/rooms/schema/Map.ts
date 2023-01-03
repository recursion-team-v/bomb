import { ArraySchema, Schema, type } from '@colyseus/schema';
import * as Constants from '../../constants/constants';

export default class Map extends Schema {
  @type(['number'])
  wallArr: number[]; // 外壁 + 内壁

  @type(['number'])
  blockArr: number[]; // 箱（破壊可能）

  constructor() {
    super();
    this.wallArr = this.generateWallArr();
    this.blockArr = this.generateBlockArr();
  }

  private generateWallArr() {
    const rows = Constants.TILE_ROWS;
    const cols = Constants.TILE_COLS;
    const arr = new Array<number>(rows * cols).fill(-1);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (x === 0 || x === cols - 1) {
          arr[x + cols * y] = Constants.TILE_WALL.DEFAULT_1_IDX;
        } else if (y === 0 || y === rows - 1) {
          arr[x + cols * y] = Constants.TILE_WALL.DEFAULT_2_IDX;
        } else if (x % 2 === 0 && y % 2 === 0) {
          arr[x + cols * y] = Constants.TILE_WALL.DEFAULT_2_IDX;
        }
      }
    }

    arr[0] = Constants.TILE_WALL.DEFAULT_CORNER_IDX;
    arr[cols - 1] = Constants.TILE_WALL.DEFAULT_CORNER_IDX;
    arr[cols * (rows - 1)] = Constants.TILE_WALL.DEFAULT_CORNER_IDX;
    arr[rows * cols - 1] = Constants.TILE_WALL.DEFAULT_CORNER_IDX;
    return new ArraySchema<number>(...arr);
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
