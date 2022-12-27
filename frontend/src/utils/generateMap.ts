export const generateGroundArray = (rows: number, cols: number) => {
  /**
   * generate ground array map from assets/tile_grounds.png
   * 0, 1, 2 <- spawn
   * 3. 4. 5 <- ground
   */

  const ground = 4;
  const spawn = 1;

  const arr = Array(rows)
    .fill(ground)
    .map(() => Array(cols).fill(ground));

  arr[1][1] = spawn;
  arr[rows - 2][1] = spawn;
  arr[1][cols - 2] = spawn;
  arr[rows - 2][cols - 2] = spawn;

  return arr;
};

export const generateWallArray = (rows: number, cols: number) => {
  /**
   * generate wall array map from assets/tiles_walls.png
   * 28, 27 <- red walls
   * 10, 19 <- dark gray walls
   * 2, 21 <- red crate
   * 1, 20 <- brown crate
   * 3, 22 <- blue crate
   */

  const defaultWalls = [10, 19];
  const defaultWallCorners = 21;
  const crate = 1;

  const arr = Array(rows)
    .fill(-1)
    .map(() => Array(cols).fill(-1));

  let crateCnt = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const rand = Phaser.Math.Between(1, 10);
      if (i === 0 || i === rows - 1) {
        arr[i][j] = defaultWalls[1];
      } else if (i === rows - 1 || j === 0 || j === cols - 1) {
        arr[i][j] = defaultWalls[0];
      } else if (crateCnt < 10 && rand < 2) {
        arr[i][j] = crate;
        crateCnt++;
      }
    }
  }

  arr[0][0] = defaultWallCorners;
  arr[0][cols - 1] = defaultWallCorners;
  arr[rows - 1][0] = defaultWallCorners;
  arr[rows - 1][cols - 1] = defaultWallCorners;

  return arr;
};
