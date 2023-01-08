import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import { Bomb } from '../../rooms/schema/Bomb';
import Player from '../../rooms/schema/Player';

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
        label: Constants.OBJECT_LABEL.PLAYER,
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
    this.gameEngine.sessionIdByBodyId.set(playerBody.id, sessionId);

    Matter.Composite.add(this.gameEngine.world, [playerBody]);
    playerBody.collisionFilter.category = Constants.COLLISION_CATEGORY.PLAYER;
    playerBody.collisionFilter.mask = Constants.COLLISION_CATEGORY.DEFAULT;
  }

  updatePlayer(player: Player, deltaTime?: number) {
    const playerState = this.gameEngine.state.getPlayer(player.sessionId);
    const playerBody = this.gameEngine.playerBodies.get(player.sessionId);
    if (playerBody === undefined || playerState === undefined) return;

    let data: any;
    const velocity = player.speed;

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    while ((data = player.inputQueue.shift())) {
      const { player: playerData, isInput } = data;

      if (isInput === false) {
        Matter.Body.setVelocity(playerBody, { x: 0, y: 0 });
      } else {
        let newVx = playerData.x - player.x;
        let newVy = playerData.y - player.y;

        if (Math.abs(newVx) > velocity) newVx = velocity * Math.sign(newVx);
        if (Math.abs(newVy) > velocity) newVy = velocity * Math.sign(newVy);

        Matter.Body.setVelocity(playerBody, { x: newVx, y: newVy });
      }

      playerState.frameKey = playerData.frameKey;
    }
  }

  placeBomb(player: Player): Bomb | null {
    if (!player.canSetBomb()) return null;
    const bomb = this.gameEngine.state.createBomb(player, player.x, player.y, player.bombStrength);
    this.gameEngine.bombService.addBomb(bomb);
    player.consumeCurrentSetBombCount();
    return bomb;
  }
}
