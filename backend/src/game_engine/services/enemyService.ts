import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class EnemyService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // add のみメソッドが違うので別に定義する
  addEnemy(sessionId: string) {
    const enemy = this.gameEngine.state.createEnemy(sessionId);
    const enemyBody = Matter.Bodies.rectangle(
      enemy.x,
      enemy.y,
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

    this.gameEngine.playerBodies.set(sessionId, enemyBody);
    this.gameEngine.sessionIdByBodyId.set(enemyBody.id, sessionId);

    Matter.Composite.add(this.gameEngine.world, [enemyBody]);
    enemyBody.collisionFilter.category = Constants.COLLISION_CATEGORY.PLAYER;
    enemyBody.collisionFilter.mask = Constants.COLLISION_CATEGORY.DEFAULT;
  }
}
