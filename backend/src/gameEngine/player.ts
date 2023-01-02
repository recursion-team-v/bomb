import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import GameEngine from '../rooms/GameEngine';
import Player from '../rooms/schema/Player';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class PlayerService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  addPlayer(sessionId: string) {
    const player = this.gameEngine.state.createPlayer(sessionId);
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
    this.gameEngine.playerBodies.set(sessionId, playerBody);
    Matter.Composite.add(this.gameEngine.world, [playerBody]);
    playerBody.collisionFilter.category = Constants.COLLISION_CATEGORY.PLAYER;
    playerBody.collisionFilter.mask = Constants.COLLISION_CATEGORY.DEFAULT;
  }

  updatePlayer(player: Player, deltaTime?: number) {
    const playerBody = this.gameEngine.playerBodies.get(player.sessionId);
    if (playerBody === undefined) return;

    let data: any;
    const velocity = player.speed;

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    while ((data = player.inputQueue.shift())) {
      let newVx = data.x - player.x;
      let newVy = data.y - player.y;

      if (Math.abs(newVx) > velocity) newVx = velocity * Math.sign(newVx);
      if (Math.abs(newVy) > velocity) newVy = velocity * Math.sign(newVy);

      Matter.Body.setVelocity(playerBody, { x: newVx, y: newVy });
    }
  }

  putBomb() {}
}
