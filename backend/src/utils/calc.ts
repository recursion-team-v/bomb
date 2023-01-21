import pathFinding from 'pathfinding';

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
// 0: 移動できないマス
// 1: 移動できるマス
export function directMovableMap(dmap: number[][], tileX: number, tileY: number): number[][] {
  const result = dfs(dmap, tileX, tileY);

  const movableMap: number[][] = Array(dmap.length)
    .fill(0)
    .map(() => Array(dmap[0].length).fill(0));
  result.forEach((tile) => {
    movableMap[tile[1]][tile[0]] = 1;
  });

  return movableMap;
}

// 今の座標から移動できるマス目を返します
function dfs(dmap: number[][], tileX: number, tileY: number): number[][] {
  const visited: number[][] = Array(dmap.length)
    .fill(0)
    .map(() => Array(dmap[0].length).fill(0));
  const stack: Array<[number, number]> = [[tileX, tileY]];
  const result: number[][] = [];

  while (stack.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [x, y] = stack.pop()!;

    // 現在地が範囲外の場合は終了
    if (x < 1 || y < 1 || x >= dmap[0].length || y >= dmap.length) continue;

    // すでに訪れたマスは終了
    if (visited[y][x] === 1) continue;

    visited[y][x] = 1;

    // 障害物がある場合は終了
    // ただし、チェックする箇所が初期位置の場合はボムが置かれていることがあるので、その場合は障害物があって探索を終了しない
    if (x === tileX && y === tileY) {
      // 何もしない
    } else {
      if (dmap[y][x] !== 2) continue;
    }

    result.push([x, y]);

    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }

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
