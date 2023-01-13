import * as Constants from '../constants/constants';

// 二次元配列を螺旋状に並べる、一次元配列を返します
export function spiralOrder(matrix: number[][]): number[] {
  const result: number[] = [];
  while (matrix.length !== 0) {
    // console.log(matrix);
    const t1 = matrix.shift();
    // console.log(t1);
    if (t1 !== undefined) result.push(...t1);
    if (matrix.length === 0) break;

    for (let i = 0; i < matrix.length; i++) {
      const t2 = matrix[i].pop();
      if (t2 !== undefined) result.push(t2);
    }

    if (matrix.length === 0) break;
    const t3 = matrix.pop();
    if (t3 !== undefined) result.push(...t3.reverse());

    if (matrix.length === 0) break;
    for (let i = matrix.length - 1; i >= 0; i--) {
      const t4 = matrix[i].shift();
      if (t4 !== undefined) result.push(t4);
    }
  }
  return result;
}

export function getWallArr(): number[][] {
  const walls: number[][] = [];
  for (let y = 0; y < Constants.TILE_ROWS - 2; y++) {
    for (let x = 0; x < Constants.TILE_COLS - 2; x++) {
      if (walls[y] === undefined) walls[y] = [];
      walls[y].push(x + (Constants.TILE_COLS - 2) * y);
    }
  }
  return walls;
}
