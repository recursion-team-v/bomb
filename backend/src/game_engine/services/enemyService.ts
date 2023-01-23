import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import Enemy from '../../rooms/schema/Enemy';
import Player from '../../rooms/schema/Player';
import { TileToPixel } from '../../utils/map';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class EnemyService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // add のみメソッドが違うので別に定義する
  addEnemy(sessionId: string): Enemy {
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

    return enemy;
  }

  updateEnemy(enemy: Enemy, deltaTime?: number) {
    const player: Player = enemy as Player;
    const playerState = this.gameEngine.state.getPlayer(player.sessionId);
    const playerBody = this.gameEngine.playerBodies.get(player.sessionId);
    if (playerBody === undefined || playerState === undefined) return;

    let data: any;

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    while ((data = player.inputQueue.shift())) {
      console.log('updateEnemy');
      const { player: playerData, inputPayload, isInput } = data;

      if (isInput === false) {
        Matter.Body.setVelocity(playerBody, { x: 0, y: 0 });
        Matter.Body.setPosition(playerBody, { x: player.x, y: player.y });
      } else {
        if (enemy.isMovedToGoal()) {
          this.stop(enemy);
          break;
        }
        const velocity = player.speed;
        let vx = 0;
        let vy = 0;
        if (inputPayload.left === true) vx -= velocity;
        if (inputPayload.right === true) vx += velocity;
        if (inputPayload.up === true) vy -= velocity;
        if (inputPayload.down === true) vy += velocity;
        Matter.Body.setVelocity(playerBody, { x: vx, y: vy });
      }
    }
  }

  stop(enemy: Enemy) {
    enemy.stop();
    const playerBody = this.gameEngine.playerBodies.get(enemy.sessionId);
    if (playerBody === undefined) return;
    Matter.Body.setVelocity(playerBody, { x: 0, y: 0 });

    // 急に止めると、マス目にぴったり止まらず爆風に当たることがあるので、マス目に合わせる
    const { x: tx, y: ty } = enemy.getTilePosition();
    Matter.Body.setPosition(playerBody, TileToPixel(tx, ty));
  }
}

// // 引数として取得する y ✖️ x の配列に blast の有無 が入っているので
// // それをもとに爆風の範囲を計算しき脅威マップを返す(1: 爆風の範囲, 0: それ以外)
// export function treatLevelMapByBlast(field: any[][]): number[][] {
//   const result: number[][] = [];

//   for (let y = 0; y < field.length; y++) {
//     for (let x = 0; x < field[y].length; x++) {
//       if (result[y] === undefined) result[y] = [];
//       result[y][x] = field[y][x] === true ? 1 : 0;
//     }
//   }

//   return result;
// }

// export function canEscapeFromBomb(enemy: Enemy, engine: GameEngine): boolean {

//   const bombMap = engine.bombMap;
//   const dmap = engine.dmap;

//   const bomb = bombMap[enemy.y][enemy.x] as Bomb;
//   if (bomb === undefined) return false;

//   const blast: Map<Constants.DIRECTION_TYPE, number> = calcBlastRange(dmap, bomb);

//   const up = blast.get(DIRECTION.UP) ?? 0;
//   const down = blast.get(DIRECTION.DOWN) ?? 0;
//   const left = blast.get(DIRECTION.LEFT) ?? 0;
//   const right = blast.get(DIRECTION.RIGHT) ?? 0;

//   const canEscape = (y: number, x: number) => {
//     if (y < 0 || y >= dmap.length) return false;
//     if (x < 0 || x >= dmap[y].length) return false;
//     if (dmap[y][x] === Constants.OBJECT_IS_NOT_MOVABLE) return false;
//     if (bombMap[y][x] !== undefined) return false;
//     return true;
//   };

//   if (canEscape(enemy.y - up, enemy.x)) return true;
//   if (canEscape(enemy.y + down, enemy.x)) return true;
//   if (canEscape(enemy.y, enemy.x - left)) return true;
//   if (canEscape(enemy.y, enemy.x + right)) return true;

//   return false;
// }
