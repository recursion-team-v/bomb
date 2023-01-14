import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import { Bomb, getSettablePosition } from '../../rooms/schema/Bomb';
import Blast from '../../rooms/schema/Blast';

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
    const br: Map<Constants.DIRECTION_TYPE, number> = this.calcBlastRange();
    const bodies = [
      this.centerBlast(),
      ...this.upperBlast(br.get(Constants.DIRECTION.UP) ?? 1),
      ...this.lowerBlast(br.get(Constants.DIRECTION.DOWN) ?? 1),
      ...this.leftBlast(br.get(Constants.DIRECTION.LEFT) ?? 1),
      ...this.rightBlast(br.get(Constants.DIRECTION.RIGHT) ?? 1),
    ];

    bodies.forEach((body) => {
      const blast = new Blast(body.id.toString(), body.position.x, body.position.y);
      this.gameEngine.state.blasts.set(body.id.toString(), blast);
    });

    Matter.Composite.add(this.gameEngine.world, bodies);
    this.bodies = bodies;

    // 爆風の有効時間を過ぎたら削除する
    this.gameEngine.room.clock.setTimeout(() => {
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
        ? Constants.DEFAULT_TIP_SIZE * Constants.BLAST_COLLISION_RATIO_X
        : Constants.DEFAULT_TIP_SIZE * Constants.BLAST_COLLISION_RATIO_Y;
    const ry =
      y === this.bomb.y
        ? Constants.DEFAULT_TIP_SIZE * Constants.BLAST_COLLISION_RATIO_X
        : Constants.DEFAULT_TIP_SIZE * Constants.BLAST_COLLISION_RATIO_Y;

    return Matter.Bodies.rectangle(bx, by, rx, ry, {
      label: Constants.OBJECT_LABEL.BLAST,
      isSensor: true,
    });
  }

  // 爆風を matter から削除する
  private delete() {
    this.bodies?.forEach((body) => {
      this.gameEngine.state.blasts.delete(body.id.toString());
      Matter.Composite.remove(this.gameEngine.world, body);
    });
  }

  // 爆風の範囲を計算する
  private calcBlastRange(): Map<Constants.DIRECTION_TYPE, number> {
    // 現在の map を取得
    const map = this.gameEngine.getDimensionalMap(this.gameEngine.getHighestPriorityFromBodies);

    // 現在の爆弾の強さを取得
    const power = this.bomb.bombStrength;

    // 現在のユーザの爆弾の位置を取得
    const x = (this.bomb.x - Constants.TILE_WIDTH / 2) / Constants.TILE_WIDTH;
    const y =
      (this.bomb.y - Constants.TILE_HEIGHT / 2 - Constants.HEADER_HEIGHT) / Constants.TILE_HEIGHT;

    // 現在のユーザの爆弾の位置から上下左右の範囲を計算
    const m = new Map<Constants.DIRECTION_TYPE, number>();
    m.set(
      Constants.DIRECTION.UP,
      calcBlastRangeFromDirection(map, x, y, power, Constants.DIRECTION.UP)
    );
    m.set(
      Constants.DIRECTION.DOWN,
      calcBlastRangeFromDirection(map, x, y, power, Constants.DIRECTION.DOWN)
    );
    m.set(
      Constants.DIRECTION.LEFT,
      calcBlastRangeFromDirection(map, x, y, power, Constants.DIRECTION.LEFT)
    );
    m.set(
      Constants.DIRECTION.RIGHT,
      calcBlastRangeFromDirection(map, x, y, power, Constants.DIRECTION.RIGHT)
    );
    return m;
  }
}

export function calcBlastRangeFromDirection(
  map: number[][],
  x: number,
  y: number,
  power: number,
  direction: Constants.DIRECTION_TYPE
): number {
  // 現在のユーザの爆弾の位置から上下左右の範囲を計算
  let size = 0;

  for (let i = 1; i <= power; i++) {
    let checkTile = 0;
    if (direction === Constants.DIRECTION.UP) checkTile = map[y - i][x];
    if (direction === Constants.DIRECTION.DOWN) checkTile = map[y + i][x];
    if (direction === Constants.DIRECTION.LEFT) checkTile = map[y][x - i];
    if (direction === Constants.DIRECTION.RIGHT) checkTile = map[y][x + i];

    if (checkTile === 0) size++;
    if (checkTile === 1) {
      size++;
      break;
    }
    if (checkTile === 2) break;
  }

  return size;
}
