import pathFinding from 'pathfinding';
import { calcBlastRange, calcBlastRangeFromDirection } from '../game_engine/services/blastService';
import { Bomb } from '../rooms/schema/Bomb';
import { TileToPixel } from './map';
import * as Constants from '../constants/constants';

function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

// 二次元配列を正規化して返します
export function normalizeDimension(dmap: number[][]): number[][] {
  const singleMap = dmap.flat();
  const min = Math.min(...singleMap);
  const max = Math.max(...singleMap) === min ? min + 1 : Math.max(...singleMap);
  const normalizedMap = dmap.map((row) => {
    return row.map((value) => {
      return normalize(value, min, max);
    });
  });

  return normalizedMap;
}

export function reverseNormalizeDimension(dmap: number[][]): number[][] {
  return dmap.map((row) => {
    return row.map((value) => {
      return Math.abs(value - 1);
    });
  });
}

// 複数の影響マップを積和合成して返します
// 参考:https://tech.cygames.co.jp/archives/2272/
// dimensionMap: 影響マップ
// ratio: 影響マップの重み
export function sumOfProductsSynthesis(
  movableMap: number[][],
  targets: Array<{ dimensionalMap: number[][]; ratio: number }>
): number[][] {
  const result: number[][] = Array(movableMap.length)
    .fill(0)
    .map(() => Array(movableMap[0].length).fill(0));

  targets.forEach((target) => {
    const { dimensionalMap, ratio } = target;
    for (let y = 0; y < movableMap.length; y++) {
      for (let x = 0; x < movableMap[y].length; x++) {
        // そもそも移動できないマスは無視する
        if (movableMap[y][x] === 0) continue;
        result[y][x] += dimensionalMap[y][x] * ratio;
        result[y][x] = Math.round(result[y][x] * 100) / 100;
      }
    }
  });

  return result;
}

// 影響度マップのうち、最も影響度の高いマスを返します
export function getHighestPriorityTile(dmap: number[][]): { x: number; y: number } {
  const singleMap = dmap.flat();
  const max = Math.max(...singleMap);
  const maxIndex = singleMap.indexOf(max);
  const y = Math.floor(maxIndex / dmap[0].length);
  const x = maxIndex % dmap[0].length;
  return { x, y };
}

// 今の座標から移動できかどうかを各マスに出力した二次元配列を返します
// 各マスには、移動できる場合は移動量、移動できない場合は Infinity が入ります
export function directMovableMap(dmap: number[][], tileX: number, tileY: number): number[][] {
  const result = dfs(dmap, tileX, tileY);

  const movableMap: number[][] = Array(dmap.length)
    .fill(0)
    .map(() => Array(dmap[0].length).fill(0));
  result.forEach((tile) => {
    movableMap[tile[1]][tile[0]] = tile[2];
  });

  return movableMap;
}

// 今の座標から移動できるマス目を返します
function dfs(dmap: number[][], tileX: number, tileY: number): number[][] {
  const visited: number[][] = Array(dmap.length)
    .fill(Infinity)
    .map(() => Array(dmap[0].length).fill(Infinity));
  const stack: Array<[number, number, number]> = [[tileX, tileY, 0]]; // 0: 移動量

  while (stack.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let [x, y, count] = stack.pop()!;

    // 現在地が範囲外の場合は終了
    if (x < 1 || y < 1 || x >= dmap[0].length || y >= dmap.length) continue;

    // 障害物がある場合は終了
    // ただし、チェックする箇所が初期位置の場合はボムが置かれていることがあるので、その場合は障害物があって探索を終了しない
    if (x === tileX && y === tileY) {
      // 何もしない
    } else {
      if (dmap[y][x] !== 2) continue;
    }

    // すでに訪れたマスは終了
    // TODO:
    if (visited[y][x] !== Infinity) {
      visited[y][x] = Math.min(visited[y][x], count);
      continue;
    }

    visited[y][x] = count;
    count++;
    stack.push([x + 1, y, count]);
    stack.push([x - 1, y, count]);
    stack.push([x, y + 1, count]);
    stack.push([x, y - 1, count]);
  }

  const result: number[][] = [];
  visited.forEach((row, y) => {
    row.forEach((value, x) => {
      result.push([x, y, value]);
    });
  });

  return result;
}

// From から To までの最短経路の配列を返します
export function searchPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  dmap: number[][]
): number[][] {
  const grid = new pathFinding.Grid(dmap[0].length, dmap.length);

  // 移動できまいマスを設定
  dmap.forEach((row, y) => {
    row.forEach((value, x) => {
      const walkable: boolean = value === 1;
      grid.setWalkableAt(x, y, walkable);
    });
  });

  // 検索アルゴリズム
  const finder = new pathFinding.AStarFinder();
  return finder.findPath(from.x, from.y, to.x, to.y, grid);
}

// 所定の位置に bomb を置いた際に、いくつブロックを破壊できるかを返す
// 最大で 4 方向にブロックを破壊できるので 4 がかえる
// movableMap は移動できるマス目のマップ
// blockMap はブロックがあるマス目のマップ
// highestPriorityForBlastRadiusMap は爆風の影響度マップ
// power は爆風の強さ
export function numberOfDestroyableBlock(
  movableMap: number[][],
  blockMap: number[][],
  highestPriorityForBlastRadiusMap: number[][],
  power: number
): number[][] {
  const result: number[][] = Array(movableMap.length)
    .fill(0)
    .map(() => Array(movableMap[0].length).fill(0));

  if (power === 0) return result;
  for (let y = 0; y < movableMap.length; y++) {
    let hasLeft = false;
    let hasRight = false;
    let hasUp = false;
    let hasDown = false;

    for (let x = 0; x < movableMap[y].length; x++) {
      // 移動できるマス(1) = ボムが設置できるマス
      if (movableMap[y][x] !== 1) continue;

      // 爆風の範囲を計算する
      const { x: bx, y: by } = TileToPixel(x, y);
      const blastRadius: Map<Constants.DIRECTION_TYPE, number> = calcBlastRange(
        highestPriorityForBlastRadiusMap,
        new Bomb(bx, by, Constants.BOMB_TYPE.NORMAL, power, 'dummy')
      );

      // ボムが設置できるマスの周囲を調べ、ブロックがあれば破壊できるとみなす
      // ただし、ブロックを貫通してブロックを破壊できないようにする
      for (let i = 1; i <= (blastRadius.get(Constants.DIRECTION.LEFT) ?? 0); i++) {
        if (x - i > 0 && !hasLeft && blockMap[y][x - i] === 1) hasLeft = true;
      }

      for (let i = 1; i <= (blastRadius.get(Constants.DIRECTION.RIGHT) ?? 0); i++) {
        if (x + i < movableMap[y].length && !hasRight && blockMap[y][x + i] === 1) hasRight = true;
      }

      for (let i = 1; i <= (blastRadius.get(Constants.DIRECTION.UP) ?? 0); i++) {
        if (y - i > 0 && !hasUp && blockMap[y - i][x] === 1) hasUp = true;
      }

      for (let i = 1; i <= (blastRadius.get(Constants.DIRECTION.DOWN) ?? 0); i++) {
        if (y + i < movableMap.length && !hasDown && blockMap[y + i][x] === 1) hasDown = true;
      }

      if (hasLeft) result[y][x] += 1;
      if (hasRight) result[y][x] += 1;
      if (hasUp) result[y][x] += 1;
      if (hasDown) result[y][x] += 1;
    }
  }

  return result;
}

// 引数として取得する y ✖️ x の配列に Bomb が入っているので
// それをもとに爆風の範囲を計算しき脅威マップを返す
// dmap: マップの配列
// bombMap: Bomb の配列
// 0: 爆風の範囲ではない /  0~1: 爆風からの距離に応じて / 1: 爆風の範囲
export function treatLevelMapByBomb(dmap: number[][], bombMap: any[][]): number[][] {
  // 1 埋めした配列を作成
  const result = Array(dmap.length)
    .fill(0)
    .map(() => Array(dmap[0].length).fill(0));

  // 爆風が存在するマス目を格納するキュー
  const bombQueue: number[][] = [];

  for (let y = 0; y < dmap.length; y++) {
    for (let x = 0; x < dmap[y].length; x++) {
      // Bomb がない場合は無視
      if (bombMap[y][x] === undefined) continue;

      const bomb = bombMap[y][x] as Bomb;
      // Bomb がある場合は爆風の範囲を計算
      const blast: Map<Constants.DIRECTION_TYPE, number> = calcBlastRange(dmap, bomb);

      // 今後爆発する範囲を脅威マップに反映
      // TODO: 爆発までの秒数に応じて脅威度を変更する (現状は 1 で固定)
      // const ratio = Date.now() / bomb.removedAt;
      const ratio = 1.0;

      result[y][x] = 1; // Bomb の位置は必ず脅威
      bombQueue.push([x, y, 1]);
      for (let i = 1; i <= (blast.get(Constants.DIRECTION.UP) ?? 0); i++) {
        result[y - i][x] = 1 * ratio;
        bombQueue.push([x, y - i, 1]);
      }
      for (let i = 1; i <= (blast.get(Constants.DIRECTION.DOWN) ?? 0); i++) {
        result[y + i][x] = 1 * ratio;
        bombQueue.push([x, y + i, 1]);
      }
      for (let i = 1; i <= (blast.get(Constants.DIRECTION.LEFT) ?? 0); i++) {
        result[y][x - i] = 1 * ratio;
        bombQueue.push([x - i, y, 1]);
      }

      for (let i = 1; i <= (blast.get(Constants.DIRECTION.RIGHT) ?? 0); i++) {
        result[y][x + i] = 1 * ratio;
        bombQueue.push([x + i, y, 1]);
      }
    }
  }

  // 爆風に近いところは脅威度を高める
  const visited = new Set();
  while (bombQueue.length > 0 && bombQueue[0] !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [x, y, distance] = bombQueue.shift()!;
    if (!visited.has(`${x},${y}`)) {
      visited.add(`${x},${y}`);

      // 爆風からの距離に応じて脅威度を変更
      result[y][x] = Math.max(Math.floor((1 / distance) * 100) / 100, result[y][x]);
      if (x > 1) bombQueue.push([x - 1, y, distance + 1]);
      if (x < result[0].length - 1) bombQueue.push([x + 1, y, distance + 1]);
      if (y > 1) bombQueue.push([x, y - 1, distance + 1]);
      if (y < result.length - 1) bombQueue.push([x, y + 1, distance + 1]);
    }
  }
  return result;
}

// 特定のマスの周囲のマスにどの程度空きマスがあるか影響度にして返す
// Constants.OBJECT_IS_MOVABLE の値を足していくので、値が大きい方が空きマスが多い
// dmap: マップの配列
// count: 空きマスをチェックするカウント数
export function treatLevelByFreeSpace(dmap: number[][], count: number): number[][] {
  const result: number[][] = Array(dmap.length)
    .fill(0)
    .map(() => Array(dmap[0].length).fill(0));

  for (let y = 0; y < dmap.length; y++) {
    for (let x = 0; x < dmap[y].length; x++) {
      // 空きマスの数をカウント
      for (let i = 1; i <= count; i++) {
        if (y - i >= 0) result[y][x] += dmap[y - i][x];
        if (y + i < dmap.length) result[y][x] += dmap[y + i][x];
        if (x - i >= 0) result[y][x] += dmap[y][x - i];
        if (x + i < dmap[y].length) result[y][x] += dmap[y][x + i];
      }
    }
  }

  return result;
}
