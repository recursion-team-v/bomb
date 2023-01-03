/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import Matter from 'matter-js';

import GameRoomState from './schema/GameRoomState';
import Player from './schema/Player';
import * as Constants from '../constants/constants';

export class GameEngine {
  world: Matter.World;
  state: GameRoomState;
  engine: Matter.Engine;

  playerBodies = new Map<string, Matter.Body>();

  constructor(state: GameRoomState) {
    this.engine = Matter.Engine.create();
    this.state = state;
    this.world = this.engine.world;

    this.engine.gravity.y = 0;

    this.init();
  }

  private createMap(rows: number, cols: number) {
    const tileWidth = Constants.TILE_WIDTH;
    const tileHeight = Constants.TILE_HEIGHT;
    const walls = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const wallIdx = this.state.gameMap.wallArr[x + cols * y];
        const blockIdx = this.state.gameMap.blockArr[x + cols * y];
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
    return walls;
  }

  init() {
    // create walls
    Matter.Composite.add(this.world, this.createMap(Constants.TILE_ROWS, Constants.TILE_COLS));
    this.initUpdateEvents();
  }

  initUpdateEvents() {
    Matter.Events.on(this.engine, 'afterUpdate', () => {
      for (const key of this.playerBodies.keys()) {
        const playerState = this.state.getPlayer(key);
        const playerBody = this.playerBodies.get(key);
        if (!playerState || !playerBody) continue;

        playerState.x = playerBody.position.x;
        playerState.y = playerBody.position.y;
        playerState.vx = playerBody.velocity.x;
        playerState.vy = playerBody.velocity.y;

        // console.log(playerState.x, playerState.y);
      }
    });
  }

  initCollision() {}

  addPlayer(sessionId: string) {
    const player = this.state.createPlayer(sessionId);
    const playerBody = Matter.Bodies.rectangle(
      player.x,
      player.y,
      Constants.PLAYER_WIDTH,
      Constants.PLAYER_HEIGHT,
      {
        label: 'PLAYER',
        chamfer: {
          radius: 10,
        },
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
        restitution: 0,
      }
    );
    this.playerBodies.set(sessionId, playerBody);
    Matter.Composite.add(this.world, [playerBody]);
    playerBody.collisionFilter.category = Constants.COLLISION_CATEGORY.PLAYER;
    playerBody.collisionFilter.mask = Constants.COLLISION_CATEGORY.DEFAULT;
  }

  updatePlayer(player: Player, deltaTime?: number) {
    const playerBody = this.playerBodies.get(player.sessionId);
    if (playerBody === undefined) return;

    let data: any;
    const velocity = player.speed;

    while ((data = player.inputQueue.shift())) {
      let newVx = data.x - player.x;
      let newVy = data.y - player.y;

      if (Math.abs(newVx) > velocity) newVx = velocity * Math.sign(newVx);
      if (Math.abs(newVy) > velocity) newVy = velocity * Math.sign(newVy);

      Matter.Body.setVelocity(playerBody, { x: newVx, y: newVy });
    }
  }
}
