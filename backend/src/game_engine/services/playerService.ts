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

  deletePlayer(sessionId: string) {
    const playerBody = this.gameEngine.playerBodies.get(sessionId);
    if (playerBody === undefined) return;

    Matter.Composite.remove(this.gameEngine.world, playerBody);
    this.gameEngine.playerBodies.delete(sessionId);
    this.gameEngine.sessionIdByBodyId.delete(playerBody.id);
    this.gameEngine.state.players.delete(sessionId);
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
        inertia: Infinity,
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

        // velocity を 0 にするだけだとちょっとずれるので、位置を補正する
        // この時、ローカルとサーバーの位置が大きい場合は、サーバーの位置に補正する
        if (
          Math.abs(playerData.x - player.x) > Constants.PLAYER_TOLERANCE_DISTANCE ||
          Math.abs(playerData.y - player.y) > Constants.PLAYER_TOLERANCE_DISTANCE
        ) {
          Matter.Body.setPosition(playerBody, { x: player.x, y: player.y });
        } else {
          Matter.Body.setPosition(playerBody, { x: playerData.x, y: playerData.y });
        }
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

  placeBomb(bomb: Bomb): boolean {
    const player = this.gameEngine.state.getPlayer(bomb.sessionId);
    if (player === undefined) return false;
    if (!player.canSetBomb()) return false;

    this.gameEngine.bombService.addBomb(bomb);
    player.consumeCurrentSetBombCount();
    return true;
  }
}
