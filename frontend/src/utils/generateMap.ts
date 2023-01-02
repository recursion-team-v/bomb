import * as Constants from '../../../backend/src/constants/constants';

export const generateGroundArray = (rows: number, cols: number) => {
  /**
   * generate ground array map from assets/tile_grounds.png
   * 0, 1, 2 <- spawn
   * 3. 4. 5 <- ground
   */

  const ground = Constants.TILE_GROUND.DEFAULT_IDX[0];
  const spawn = Constants.TILE_GROUND.SPAWN_IDX[0];

  const arr = Array(rows)
    .fill(ground)
    .map(() => Array(cols).fill(ground));

  arr[1][1] = spawn;
  arr[rows - 2][1] = spawn;
  arr[1][cols - 2] = spawn;
  arr[rows - 2][cols - 2] = spawn;

  return arr;
};
