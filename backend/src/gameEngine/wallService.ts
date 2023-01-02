import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import GameEngine from '../rooms/GameEngine';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class WallService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  addWalls(rows: number, cols: number) {
    const walls = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
          walls.push(
            Matter.Bodies.rectangle(
              Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * j,
              Constants.HEADER_HEIGHT + Constants.TILE_HEIGHT / 2 + Constants.TILE_HEIGHT * i,
              Constants.TILE_WIDTH,
              Constants.TILE_HEIGHT,
              {
                isStatic: true,
                label: 'WALL',
              }
            )
          );
        }
      }
    }

    Matter.Composite.add(this.gameEngine.world, walls);
    return walls;
  }
}
