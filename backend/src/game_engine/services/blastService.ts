import GameEngine from '../../rooms/GameEngine';

export default class BlastService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // 爆風を matter に追加する
  add() {}

  // 爆風を matter から削除する
  private delete() {}

  // 爆風の範囲を計算する
  private calcBlastRange() {}

  // 現在のユーザの爆弾の強さを取得する
  private getPlayerBombStrength() {}
}
