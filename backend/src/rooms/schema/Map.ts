import { ArraySchema, Schema, type } from '@colyseus/schema';
import Matter from 'matter-js';
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

export const createMapWalls = (rows: number, cols: number) => {
  const tileWidth = Constants.TILE_WIDTH;
  const tileHeight = Constants.TILE_HEIGHT;
  const walls = [];

  // outer walls
  for (let y = 0; y < rows; y++) {
    walls.push(createWall(0, y, tileWidth, tileHeight));
    walls.push(createWall(cols - 1, y, tileWidth, tileHeight));
  }
  for (let x = 1; x < cols - 1; x++) {
    walls.push(createWall(x, 0, tileWidth, tileHeight));
    walls.push(createWall(x, rows - 1, tileWidth, tileHeight));
  }

  // inner walls
  for (let y = 2; y < rows; y += 2) {
    for (let x = 2; x < cols; x += 2) {
      walls.push(createWall(x, y, tileWidth, tileHeight, Constants.TILE_WALL.INNER_CHAMFER));
    }
  }

  return walls;
};

const createWall = (x: number, y: number, tileWidth: number, tileHeight: number, radius = 0) => {
  return Matter.Bodies.rectangle(
    tileWidth / 2 + tileWidth * x,
    Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y,
    tileWidth * 0.9,
    tileHeight * 0.9,
    {
      chamfer: {
        radius,
      },
      isStatic: true,
      label: 'WALL',
    }
  );
};
