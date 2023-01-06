import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class MapService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  createMapWalls(rows: number, cols: number) {
    const tileWidth = Constants.TILE_WIDTH;
    const tileHeight = Constants.TILE_HEIGHT;
    const walls = [];

    // outer walls
    for (let y = 0; y < rows; y++) {
      walls.push(this.createWall(0, y, tileWidth, tileHeight));
      walls.push(this.createWall(cols - 1, y, tileWidth, tileHeight));
    }
    for (let x = 1; x < cols - 1; x++) {
      walls.push(this.createWall(x, 0, tileWidth, tileHeight));
      walls.push(this.createWall(x, rows - 1, tileWidth, tileHeight));
    }

    // inner walls
    for (let y = 2; y < rows; y += 2) {
      for (let x = 2; x < cols; x += 2) {
        walls.push(this.createWall(x, y, tileWidth, tileHeight, Constants.TILE_WALL.INNER_CHAMFER));
      }
    }

    Matter.Composite.add(this.gameEngine.world, walls);
  }

  createMapBlocks(rows: number, cols: number, blockArr: number[]) {
    const tileWidth = Constants.TILE_WIDTH;
    const tileHeight = Constants.TILE_HEIGHT;

    const blocks = [];
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        if (blockArr[x + y * cols] === Constants.TILE_BLOCK_IDX) {
          blocks.push(this.createBlock(x, y, tileWidth, tileHeight));
        }
      }
    }

    Matter.Composite.add(this.gameEngine.world, blocks);
  }

  private createWall(x: number, y: number, tileWidth: number, tileHeight: number, radius = 0) {
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
        label: Constants.OBJECT_LABEL.WALL,
      }
    );
  }

  private createBlock(x: number, y: number, tileWidth: number, tileHeight: number) {
    return Matter.Bodies.rectangle(
      tileWidth / 2 + tileWidth * x,
      Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y,
      tileWidth,
      tileHeight,
      {
        isStatic: true,
        label: Constants.OBJECT_LABEL.BLOCK,
      }
    );
  }
}
