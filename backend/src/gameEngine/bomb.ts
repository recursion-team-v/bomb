import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import GameEngine from '../rooms/GameEngine';
import { Bomb } from '../rooms/schema/Bomb';

export default class BombService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // ボムを matter に追加する
  addBomb(bomb: Bomb) {
    const bombBody = Matter.Bodies.rectangle(
      bomb.x,
      bomb.y,
      Constants.DEFAULT_TIP_SIZE,
      Constants.DEFAULT_TIP_SIZE,
      {
        label: Constants.LABEL_BOMB,
        isSensor: true,
        isStatic: true,
      }
    );
    Matter.Composite.add(this.gameEngine.world, [bombBody]);
    this.gameEngine.bombBodies.set(bomb.id, bombBody);
  }

  // ボムを matter から削除する
  deleteBomb(bomb: Bomb) {
    const bombBody = this.gameEngine.bombBodies.get(bomb.id);
    if (bombBody === undefined) return;
    Matter.Composite.remove(this.gameEngine.world, bombBody);
    this.gameEngine.bombBodies.delete(bomb.id);
  }
}
