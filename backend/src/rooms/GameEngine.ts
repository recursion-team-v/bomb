/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import Matter from 'matter-js';
import GameRoomState from './schema/GameRoomState';
import Player from './schema/Player';

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

  private addWalls(rows: number, cols: number) {
    const walls = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
          walls.push(
            Matter.Bodies.rectangle(32 + 64 * j, 92 + 64 * i, 64, 64, {
              isStatic: true,
              label: 'WALL',
            })
          );
        }
      }
    }
    return walls;
  }

  init() {
    // create walls
    Matter.Composite.add(this.world, this.addWalls(13, 15));
    this.initUpdateEvents();
  }

  initUpdateEvents() {
    Matter.Events.on(this.engine, 'afterUpdate', () => {
      for (const key of this.playerBodies.keys()) {
        const playerState = this.state.getPlayer(key);
        const playerBody = this.playerBodies.get(key);
        if (!playerState || !playerBody) continue;

        playerState.x = Math.floor(playerBody.position.x);
        playerState.y = Math.floor(playerBody.position.y);
        playerState.vx = playerBody.velocity.x;
        playerState.vy = playerBody.velocity.y;

        // console.log(playerState.x, playerState.y);
      }
    });
  }

  initCollision() {}

  addPlayer(sessionId: string) {
    const player = this.state.createPlayer(sessionId);
    const playerBody = Matter.Bodies.rectangle(player.x, player.y, 64, 64, {
      label: 'PLAYER',
      chamfer: {
        radius: 10,
      },
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 0,
    });
    this.playerBodies.set(sessionId, playerBody);
    Matter.Composite.add(this.world, [playerBody]);
  }

  updatePlayer(player: Player, deltaTime?: number) {
    const playerBody = this.playerBodies.get(player.sessionId);
    if (playerBody === undefined) return;

    let data: any;
    const velocity = player.speed;

    while ((data = player.inputQueue.shift())) {
      let newVx = 0;
      let newVy = 0;

      if (data.left) {
        newVx -= velocity;
      } else if (data.right) {
        newVx += velocity;
      }

      if (data.up) {
        newVy -= velocity;
      } else if (data.down) {
        newVy += velocity;
      }

      Matter.Body.setVelocity(playerBody, { x: newVx, y: newVy });
    }
  }
}
