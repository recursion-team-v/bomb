import * as Constants from '../../../backend/src/constants/constants';
import { ObjectTypes } from '../types/objects';

const rows = Constants.TILE_ROWS;
const cols = Constants.TILE_COLS;
const tileWidth = Constants.TILE_WIDTH;
const tileHeight = Constants.TILE_HEIGHT;

export const drawGround = (scene: Phaser.Scene) => {
  const groundArray = generateGroundArray(rows, cols);
  const groundMap = scene.make.tilemap({
    data: groundArray,
    tileWidth,
    tileHeight,
  });
  groundMap.addTilesetImage('tile_grounds', undefined, tileWidth, tileHeight, 0, 0);
  groundMap.createLayer(0, 'tile_grounds', 0, Constants.HEADER_HEIGHT).setDepth(-2);
};

export const drawWalls = (scene: Phaser.Scene, wallArr: number[]) => {
  const arr = convertTo2D(wallArr);
  const wallMap = scene.make.tilemap({ data: arr, tileWidth, tileHeight });
  wallMap.addTilesetImage('tile_walls', undefined, tileWidth, tileHeight, 0, 0);
  const wallLayer = wallMap
    .createLayer(0, 'tile_walls', 0, Constants.HEADER_HEIGHT)
    .setDepth(-1)
    .setCollision([
      Constants.TILE_WALL.DEFAULT_1_IDX,
      Constants.TILE_WALL.DEFAULT_2_IDX,
      Constants.TILE_WALL.DEFAULT_CORNER_IDX,
    ]);
  scene.matter.world.convertTilemapLayer(wallLayer, { label: ObjectTypes.WALL });
};

export const drawBlocks = (scene: Phaser.Scene, blockArr: number[]) => {
  const arr = convertTo2D(blockArr);
  const blockMap = scene.make.tilemap({ data: arr, tileWidth, tileHeight });
  blockMap.addTilesetImage('tile_walls', undefined, tileWidth, tileHeight, 0, 0);
  const blockLayer = blockMap
    .createLayer(0, 'tile_walls', 0, Constants.HEADER_HEIGHT)
    .setDepth(-1)
    .setCollision([Constants.TILE_BLOCK_IDX]);
  scene.matter.world.convertTilemapLayer(blockLayer, { label: ObjectTypes.BLOCK });
};

const generateGroundArray = (rows: number, cols: number) => {
  const tileIdx = Math.floor(Math.random() * 10) % Constants.TILE_GROUND.DEFAULT_IDX.length;
  const ground = Constants.TILE_GROUND.DEFAULT_IDX[tileIdx];
  const spawn = Constants.TILE_GROUND.SPAWN_IDX[tileIdx];

  const arr = Array(rows)
    .fill(ground)
    .map(() => Array(cols).fill(ground));

  arr[1][1] = spawn;
  arr[rows - 2][1] = spawn;
  arr[1][cols - 2] = spawn;
  arr[rows - 2][cols - 2] = spawn;

  return arr;
};

const convertTo2D = (data: number[]) => {
  const arr = Array(rows)
    .fill(-1)
    .map(() => Array(cols).fill(-1));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      arr[y][x] = data[x + cols * y];
    }
  }

  return arr;
};
