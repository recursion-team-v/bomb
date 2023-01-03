import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import GameEngine from '../rooms/GameEngine';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class MapService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  createMap(rows: number, cols: number) {
    const tileWidth = Constants.TILE_WIDTH;
    const tileHeight = Constants.TILE_HEIGHT;
    const walls = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const wallIdx = this.gameEngine.state.gameMap.wallArr[x + cols * y];
        const blockIdx = this.gameEngine.state.gameMap.blockArr[x + cols * y];
        if (
          wallIdx === Constants.TILE_WALL.DEFAULT_1_IDX ||
          wallIdx === Constants.TILE_WALL.DEFAULT_2_IDX ||
          wallIdx === Constants.TILE_WALL.DEFAULT_CORNER_IDX
        ) {
          walls.push(
            Matter.Bodies.rectangle(
              tileWidth / 2 + tileWidth * x,
              Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y,
              tileWidth,
              tileHeight,
              {
                isStatic: true,
                label: 'WALL',
              }
            )
          );
        } else if (blockIdx === Constants.TILE_BLOCK_IDX) {
          walls.push(
            Matter.Bodies.rectangle(
              tileWidth / 2 + tileWidth * x,
              Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y,
              tileWidth,
              tileHeight,
              {
                isStatic: true,
                label: 'BLOCK',
              }
            )
          );
        }
      }
    }
    Matter.Composite.add(this.gameEngine.world, walls);
  }
}
