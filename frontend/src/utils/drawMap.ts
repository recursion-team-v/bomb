import { MapSchema } from '@colyseus/schema';

import * as Constants from '../../../backend/src/constants/constants';
import Block from '../../../backend/src/rooms/schema/Block';
import { Event, gameEvents } from '../events/GameEvents';
import { Block as BlockBody } from '../items/Block';

const rows = Constants.TILE_ROWS;
const cols = Constants.TILE_COLS;
const tileWidth = Constants.TILE_WIDTH;
const tileHeight = Constants.TILE_HEIGHT;

export const drawGround = (scene: Phaser.Scene) => {
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const random = Phaser.Math.Between(0, 10);
      const newx = tileWidth / 2 + tileWidth * x;
      const newy = Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y;
      const texture = random > 7 ? Constants.MAP_ASSETS.grass_1 : Constants.MAP_ASSETS.grass_2;
      scene.add.sprite(newx, newy, texture);
      if (!(x % 2 === 0 && y % 2 === 0)) {
        if (random < 2) {
          scene.add.sprite(newx, newy, Constants.MAP_ASSETS.plants, Phaser.Math.Between(0, 6));
        }
      }
    }
  }
};

export const drawWalls = (scene: Phaser.Scene) => {
  for (let x = 0; x < cols; x++) {
    if (x === 0) {
      addOuterWall(scene, x, 0, Constants.GROUND_TYPES.top_left);
      addOuterWall(scene, x, rows - 1, Constants.GROUND_TYPES.bottom_left);
    } else if (x === cols - 1) {
      addOuterWall(scene, x, 0, Constants.GROUND_TYPES.top_right);
      addOuterWall(scene, x, rows - 1, Constants.GROUND_TYPES.bottom_right);
    } else {
      addOuterWall(scene, x, 0, Constants.GROUND_TYPES.top);
      addOuterWall(scene, x, rows - 1, Constants.GROUND_TYPES.bottom);
    }
  }
  for (let y = 1; y < rows - 1; y++) {
    addOuterWall(scene, 0, y, Constants.GROUND_TYPES.left);
    addOuterWall(scene, cols - 1, y, Constants.GROUND_TYPES.right);
  }

  // add inner walls
  for (let y = 2; y < rows - 1; y += 2) {
    for (let x = 2; x < cols - 1; x += 2) {
      const random = Phaser.Math.Between(1, 2);
      const texture = random === 1 ? Constants.MAP_ASSETS.rock_1 : Constants.MAP_ASSETS.rock_2;
      addInnerWall(scene, x, y, texture);
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

    const b = scene.add.block(block.x, block.y - randomHeight);
    currBlocks.set(block.id, b);
    b.setDepth(101);
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
