import * as Constants from '../../../backend/src/constants/constants';
import MapTiles from '../../../backend/src/rooms/schema/MapTiles';
import { MapSchema } from '@colyseus/schema';
import Block from '../../../backend/src/rooms/schema/Block';
import { Block as BlockBody } from '../items/Block';

const rows = Constants.TILE_ROWS;
const cols = Constants.TILE_COLS;
const tileWidth = Constants.TILE_WIDTH;
const tileHeight = Constants.TILE_HEIGHT;

export const drawGround = (scene: Phaser.Scene, groundIdx: number) => {
  const groundArray = generateGroundArray(rows, cols, groundIdx);
  const groundMap = scene.make.tilemap({
    data: groundArray,
    tileWidth,
    tileHeight,
  });
  groundMap.addTilesetImage('tile_grounds', undefined, tileWidth, tileHeight, 0, 0);
  groundMap.createLayer(0, 'tile_grounds', 0, Constants.HEADER_HEIGHT).setAlpha(0.7).setDepth(-2);
};

export const drawWalls = (scene: Phaser.Scene, mapTiles: MapTiles) => {
  // add outer walls
  for (let x = 0; x < cols; x++) {
    if (x === 0 || x === cols - 1) {
      addOuterWall(scene, x, 0, mapTiles.OUTER_WALL_CORNER);
      addOuterWall(scene, x, rows - 1, mapTiles.OUTER_WALL_CORNER);
    } else {
      addOuterWall(scene, x, 0, mapTiles.OUTER_WALL_TOP_BOT);
      addOuterWall(scene, x, rows - 1, mapTiles.OUTER_WALL_TOP_BOT);
    }
  }
  for (let y = 1; y < rows - 1; y++) {
    addOuterWall(scene, 0, y, mapTiles.OUTER_WALL_LEFT_RIGHT);
    addOuterWall(scene, cols - 1, y, mapTiles.OUTER_WALL_LEFT_RIGHT);
  }

  // add inner walls
  for (let y = 2; y < rows - 1; y += 2) {
    for (let x = 2; x < cols - 1; x += 2) {
      addInnerWall(scene, x, y, mapTiles.INNER_WALL);
    }
  }
};

export const drawBlocks = (scene: Phaser.Scene, blocks: MapSchema<Block>) => {
  const currBlocks = new Map<string, BlockBody>();
  blocks.forEach((block) => {
    currBlocks.set(block.id, scene.add.block(block.x, block.y, Constants.TILE_BLOCK_IDX));
  });
  return currBlocks;
};

const generateGroundArray = (rows: number, cols: number, groundIdx: number) => {
  const ground = Constants.TILE_GROUND.DEFAULT_IDX[groundIdx];
  const spawn = Constants.TILE_GROUND.SPAWN_IDX[groundIdx];

  const arr = Array(rows)
    .fill(ground)
    .map(() => Array(cols).fill(ground));

  arr[1][1] = spawn;
  arr[rows - 2][1] = spawn;
  arr[1][cols - 2] = spawn;
  arr[rows - 2][cols - 2] = spawn;

  return arr;
};

const addInnerWall = (scene: Phaser.Scene, x: number, y: number, frame: number) => {
  scene.add.innerWall(
    tileWidth / 2 + tileWidth * x,
    Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y,
    frame
  );
};

const addOuterWall = (scene: Phaser.Scene, x: number, y: number, frame: number) => {
  scene.add.outerWall(
    tileWidth / 2 + tileWidth * x,
    Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y,
    frame
  );
};
