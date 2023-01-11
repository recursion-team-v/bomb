import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import { Bomb } from '../../rooms/schema/Bomb';
import BlastService from './blastService';

export default class BombService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // ボムを matter に追加する
  addBomb(bomb: Bomb): boolean {
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

    // 既にボムがある場所には設置できない
    if (this.isExistsBombOnPosition(bomb.x, bomb.y)) {
      this.deleteBomb(bomb);
      return false;
    }

    Matter.Composite.add(this.gameEngine.world, [bombBody]);
    this.gameEngine.bombBodies.set(bomb.id, bombBody);
    this.gameEngine.bombIdByBodyId.set(bombBody.id, bomb.id);
    return true;
  }

  // ボムを matter から削除する
  private deleteBomb(bomb: Bomb) {
    this.gameEngine.state.deleteBomb(bomb);
    const bombBody = this.gameEngine.bombBodies.get(bomb.id);
    if (bombBody === undefined) return;
    Matter.Composite.remove(this.gameEngine.world, bombBody);
    this.gameEngine.bombBodies.delete(bomb.id);
  }

  explode(bomb: Bomb) {
    // 既に爆発している場合は処理を終了する
    if (!bomb.isExploded()) {
      bomb.explode();

      // 爆風を作成する
      const blastService = new BlastService(this.gameEngine, bomb);
      blastService.add();

      // 設置者のボム数を増やす
      const player = this.gameEngine.getPlayer(bomb.sessionId);
      if (player !== undefined) {
        // ボムを設置したプレイヤーの設置中のボム数を減らす
        player.decreaseSetBombCount();
      }
    }

    // ボムを削除する
    this.deleteBomb(bomb);
  }

  // 誘爆の処理
  detonated(bombId: string) {
    const bomb = this.gameEngine.state.bombs.get(bombId);
    if (bomb === undefined) return;

    // 誘爆の場合は爆発までの delay を入れる
    setTimeout(() => this.explode(bomb), Constants.BOMB_DETONATION_DELAY);
  }

  // 指定した位置にボムが存在するかどうかを返す
  private isExistsBombOnPosition(x: number, y: number): boolean {
    let isExists = false;
    this.gameEngine.bombBodies.forEach((bombBody) => {
      if (bombBody.position.x === x && bombBody.position.y === y) {
        isExists = true;
      }
    });
    return isExists;
  }
}
