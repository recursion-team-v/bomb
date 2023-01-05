import Matter from 'matter-js';

import GameEngine from '../../rooms/GameEngine';
import { Bomb } from '../../rooms/schema/Bomb';

export default class BlastService {
  private readonly gameEngine: GameEngine;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private blastComposite?: Matter.Composite;
  private readonly bomb: Bomb;

  constructor(gameEngine: GameEngine, bomb: Bomb) {
    this.gameEngine = gameEngine;
    this.bomb = bomb;
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
  private getPlayerBombStrength(): number {
    return this.bomb.owner.getBombStrength();
  }
}
