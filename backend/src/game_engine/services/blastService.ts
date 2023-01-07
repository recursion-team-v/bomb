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
    const br: Map<string, number> = this.calcBlastRange();
    const bodies = [
      this.centerBlast(),
      ...this.upperBlast(br.get('upper') ?? 1),
      ...this.lowerBlast(br.get('lower') ?? 1),
      ...this.leftBlast(br.get('left') ?? 1),
      ...this.rightBlast(br.get('right') ?? 1),
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

    // 爆弾の位置から上下左右の差分から、縦横のどちらの爆風かチェックして、有効な当たり範囲の比率をかける
    const rx =
      x === this.bomb.x
        ? Constants.DEFAULT_TIP_SIZE * Constants.BOMB_COLLISION_RATIO
        : Constants.DEFAULT_TIP_SIZE;
    const ry =
      y === this.bomb.y
        ? Constants.DEFAULT_TIP_SIZE * Constants.BOMB_COLLISION_RATIO
        : Constants.DEFAULT_TIP_SIZE;

    return Matter.Bodies.rectangle(bx, by, rx, ry, {
      label: Constants.OBJECT_LABEL.BLAST,
      isSensor: true,
      isStatic: true,
    });
  }

  // 爆風を matter から削除する
  private delete() {
    this.bodies?.forEach((body) => Matter.Composite.remove(this.gameEngine.world, body));
  }

  // 爆風の範囲を計算する
  private calcBlastRange(): Map<string, number> {
    // 現在の map を取得
    const map = this.gameEngine.getDimensionalMap(this.gameEngine.getHighestPriorityFromBodies);

    // 現在のユーザの爆弾の強さを取得
    const power = this.getPlayerBombStrength();

    // 現在のユーザの爆弾の位置を取得
    const x = (this.bomb.x - Constants.TILE_WIDTH / 2) / Constants.TILE_WIDTH;
    const y =
      (this.bomb.y - Constants.TILE_HEIGHT / 2 - Constants.HEADER_HEIGHT) / Constants.TILE_HEIGHT;

    // 現在のユーザの爆弾の位置から上下左右の範囲を計算
    const m = new Map<string, number>();
    m.set('upper', this.calcBlastRangeFromDirection(map, x, y, power, 'upper'));
    m.set('lower', this.calcBlastRangeFromDirection(map, x, y, power, 'lower'));
    m.set('left', this.calcBlastRangeFromDirection(map, x, y, power, 'left'));
    m.set('right', this.calcBlastRangeFromDirection(map, x, y, power, 'right'));
    return m;
  }

  private calcBlastRangeFromDirection(
    map: number[][],
    x: number,
    y: number,
    power: number,
    direction: 'upper' | 'lower' | 'left' | 'right'
  ): number {
    // 現在のユーザの爆弾の位置から上下左右の範囲を計算
    let size = 0;

    for (let i = 1; i <= power; i++) {
      if (direction === 'upper' && map[y - i][x] !== 0) break;
      if (direction === 'lower' && map[y + i][x] !== 0) break;
      if (direction === 'left' && map[y][x - i] !== 0) break;
      if (direction === 'right' && map[y][x + i] !== 0) break;
      size++;
    }

    return size;
  }

  // 現在のユーザの爆弾の強さを取得する
  private getPlayerBombStrength(): number {
    const player = this.gameEngine.getPlayer(this.bomb.sessionId);
    if (player === undefined) {
      return Constants.INITIAL_BOMB_STRENGTH;
    } else {
      return player.getBombStrength();
    }
  }
}
