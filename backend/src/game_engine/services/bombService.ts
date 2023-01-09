import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import { Bomb } from '../../rooms/schema/Bomb';
import BlastService from './blastService';

export default class BombService {
  private readonly gameEngine: GameEngine;
  private blastService?: BlastService;

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
        label: Constants.OBJECT_LABEL.BOMB,
        isSensor: true,
        isStatic: true,
      }
    );
    Matter.Composite.add(this.gameEngine.world, [bombBody]);
    this.gameEngine.bombBodies.set(bomb.id, bombBody);
    this.gameEngine.bombIdByBodyId.set(bombBody.id, bomb.id);

    this.blastService = new BlastService(this.gameEngine, bomb);
  }

  // ボムを matter から削除する
  private deleteBomb(bomb: Bomb) {
    const bombBody = this.gameEngine.bombBodies.get(bomb.id);
    if (bombBody === undefined) return;
    Matter.Composite.remove(this.gameEngine.world, bombBody);
    this.gameEngine.bombBodies.delete(bomb.id);
  }

  explode(bomb: Bomb) {
    // 爆風を作成する
    this.blastService?.add();

    // 設置者のボム数を増やす
    const player = this.gameEngine.getPlayer(bomb.sessionId);
    if (player !== undefined) {
      player.recoverSettableBombCount();
    }

    // ボムを削除する
    this.deleteBomb(bomb);
  }
}
