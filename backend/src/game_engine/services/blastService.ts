import Matter from 'matter-js';

import GameEngine from '../../rooms/GameEngine';

export default class BlastService {
  private readonly gameEngine: GameEngine;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private blastComposite: Matter.Composite;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // 爆風を matter に追加する
  add() {}

  // 爆風を matter から削除する
  private delete() {
    if (this.blastComposite === undefined) return;
    Matter.Composite.remove(this.gameEngine.world, this.blastComposite);
  }

  // 爆風の範囲を計算する
  private calcBlastRange() {}

  // 現在のユーザの爆弾の強さを取得する
  private getPlayerBombStrength() {}
}
