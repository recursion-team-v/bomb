import { MapSchema } from '@colyseus/schema';

import * as Constants from '../../../backend/src/constants/constants';
import Block from '../../../backend/src/rooms/schema/Block';
import MapTiles from '../../../backend/src/rooms/schema/MapTiles';
import { Event, gameEvents } from '../events/GameEvents';
import { Block as BlockBody } from '../items/Block';

const rows = Constants.TILE_ROWS;
const cols = Constants.TILE_COLS;
const tileWidth = Constants.TILE_WIDTH;
const tileHeight = Constants.TILE_HEIGHT;

export const drawGround = (scene: Phaser.Scene, groundIdx: number) => {
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const newx = tileWidth / 2 + tileWidth * x;
      const newy = Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y;
      scene.add.sprite(newx, newy, 'ground_grass');
    }
  }
};

export const drawWalls = (scene: Phaser.Scene, mapTiles: MapTiles) => {
  for (let x = 0; x < cols; x++) {
    if (x === 0) {
      addOuterWall(scene, x, 0, Constants.GROUND_TILES.top_left);
      addOuterWall(scene, x, rows - 1, Constants.GROUND_TILES.bottom_left);
    } else if (x === cols - 1) {
      addOuterWall(scene, x, 0, Constants.GROUND_TILES.top_right);
      addOuterWall(scene, x, rows - 1, Constants.GROUND_TILES.bottom_right);
    } else {
      addOuterWall(scene, x, 0, Constants.GROUND_TILES.top);
      addOuterWall(scene, x, rows - 1, Constants.GROUND_TILES.bottom);
    }
  }
  for (let y = 1; y < rows - 1; y++) {
    addOuterWall(scene, 0, y, Constants.GROUND_TILES.left);
    addOuterWall(scene, cols - 1, y, Constants.GROUND_TILES.right);
  }

  // add inner walls
  for (let y = 2; y < rows - 1; y += 2) {
    for (let x = 2; x < cols - 1; x += 2) {
      addInnerWall(scene, x, y, 'rock');
    }
  }
};

export const drawBlocks = (scene: Phaser.Scene, blocks: MapSchema<Block>) => {
  const currBlocks = new Map<string, BlockBody>();
  let eventCount = 0;
  let flag = true;

  blocks.forEach((block) => {
    const random = Math.random();
    let randomHeight = random * Constants.GAME_PREPARING_TIME * 1000;
    if (flag) {
      randomHeight = Constants.GAME_PREPARING_TIME * 1000; // 必ず一つのブロックをゲーム開始演出時間に合わせる
      flag = false;
    }
    const shadow = scene.add
      .rectangle(
        block.x,
        block.y,
        Constants.TILE_WIDTH * 1.0,
        Constants.TILE_HEIGHT * 1.0,
        Constants.BLACK,
        random * 0.8
      )
      .setDepth(Constants.OBJECT_DEPTH.DROP_WALL_SHADOW);

    const b = scene.add.block(block.x, block.y - randomHeight, Constants.TILE_BLOCK_IDX);
    currBlocks.set(block.id, b);
    b.setDepth(Infinity);
    b.setSensor(true);

    scene.add.tween({
      targets: currBlocks.get(block.id),
      y: `+=${randomHeight}`,
      duration: randomHeight,
      repeat: 0,
      onUpdate: () => {
        shadow.setAlpha(shadow.alpha - 0.003);
      },
      onComplete: () => {
        scene.cameras.main.shake(200, 0.001);
        b.setDepth(Constants.OBJECT_DEPTH.BLOCK);
        b.setSensor(false);
        shadow.destroy();
        eventCount++;
        if (eventCount === blocks.size) {
          gameEvents.emit(Event.GAME_PREPARING_COMPLETED);
        }
      },
    });
  });

  return currBlocks;
};

// const generateGroundArray = (rows: number, cols: number, groundIdx: number) => {
//   const ground = Constants.TILE_GROUND.DEFAULT_IDX[groundIdx];

//   const arr = Array(rows)
//     .fill(ground)
//     .map(() => Array(cols).fill(ground));

//   // 市松模様にする
//   for (let y = 1; y < rows - 1; y++) {
//     for (let x = 1; x < cols - 1; x++) {
//       // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
//       if ((y + x) % 2 === 0) arr[y][x] = arr[y][x] + 3; // 暗い画像が + 3 の位置にあるので
//     }
//   }

//   return arr;
// };

const addInnerWall = (scene: Phaser.Scene, x: number, y: number, texture: string) => {
  scene.add.innerWall(
    tileWidth / 2 + tileWidth * x,
    Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y,
    texture
  );
};

const addOuterWall = (scene: Phaser.Scene, x: number, y: number, groundType: string) => {
  const newx = tileWidth / 2 + tileWidth * x;
  const newy = Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y;
  const textureKey = `ground_${groundType}`;
  scene.add.outerWall(newx, newy, textureKey).play(groundType);
};
