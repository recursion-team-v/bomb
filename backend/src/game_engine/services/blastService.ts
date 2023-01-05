import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import { Bomb, getSettablePosition } from '../../rooms/schema/Bomb';

export default class BlastService {
  private readonly gameEngine: GameEngine;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private bodies?: Matter.Body[];
  private readonly bomb: Bomb;

  constructor(gameEngine: GameEngine, bomb: Bomb) {
    this.gameEngine = gameEngine;
    this.bomb = bomb;
  }

  // 爆風を matter に追加する
  add() {
    const power = this.getPlayerBombStrength();

    // TODO: calcBlastRange で爆風の範囲を計算する

    const bodies = [
      this.centerBlast(),
      ...this.upperBlast(power),
      ...this.lowerBlast(power),
      ...this.leftBlast(power),
      ...this.rightBlast(power),
    ];

    Matter.Composite.add(this.gameEngine.world, bodies);
    this.bodies = bodies;

    // 爆風の有効時間を過ぎたら削除する
    setTimeout(() => {
      this.delete();
    }, Constants.BLAST_AVAILABLE_TIME);
  }

  // 現在位置の爆風を生成する
  private centerBlast(): Matter.Body {
    return this.genBodies(this.bomb.x, this.bomb.y);
  }

  // 上方向の爆風を count の数だけ生成する
  private upperBlast(count: number): Matter.Body[] {
    const bodies: Matter.Body[] = [];
    for (let i = 1; i <= count; i++) {
      bodies.push(this.genBodies(this.bomb.x, this.bomb.y - i * Constants.DEFAULT_TIP_SIZE));
    }
    return bodies;
  }

  // 下方向の爆風を count の数だけ生成する
  private lowerBlast(count: number): Matter.Body[] {
    const bodies: Matter.Body[] = [];
    for (let i = 1; i <= count; i++) {
      bodies.push(this.genBodies(this.bomb.x, this.bomb.y + i * Constants.DEFAULT_TIP_SIZE));
    }
    return bodies;
  }

  // 左方向の爆風を count の数だけ生成する
  private leftBlast(count: number): Matter.Body[] {
    const bodies: Matter.Body[] = [];
    for (let i = 1; i <= count; i++) {
      bodies.push(this.genBodies(this.bomb.x - i * Constants.DEFAULT_TIP_SIZE, this.bomb.y));
    }
    return bodies;
  }

  // 右方向の爆風を count の数だけ生成する
  private rightBlast(count: number): Matter.Body[] {
    const bodies: Matter.Body[] = [];
    for (let i = 1; i <= count; i++) {
      bodies.push(this.genBodies(this.bomb.x + i * Constants.DEFAULT_TIP_SIZE, this.bomb.y));
    }
    return bodies;
  }

  // 爆風の matter body を作成する
  private genBodies(x: number, y: number): Matter.Body {
    const { bx, by } = getSettablePosition(x, y);
    return Matter.Bodies.rectangle(
      bx,
      by,
      Constants.DEFAULT_TIP_SIZE * Constants.BOMB_COLLISION_RATIO,
      Constants.DEFAULT_TIP_SIZE * Constants.BOMB_COLLISION_RATIO,
      {
        label: Constants.OBJECT_LABEL.BLAST,
        isSensor: true,
        isStatic: true,
      }
    );
  }

  // 爆風を matter から削除する
  private delete() {
    this.bodies?.forEach((body) => Matter.Composite.remove(this.gameEngine.world, body));
  }

  // 爆風の範囲を計算する
  private calcBlastRange() {}

  // 現在のユーザの爆弾の強さを取得する
  private getPlayerBombStrength(): number {
    return this.bomb.owner.getBombStrength();
  }
}
