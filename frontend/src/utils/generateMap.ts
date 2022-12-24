export const generateGroundArray = (rows: number, cols: number) => {
  /**
   * generate ground array map from assets/tile_grounds.png
   * 18 <- default ground
   * 19 <- default ground variation
   * 20 <- wall ground
   * 21 <- wall ground variation
   * 16, 17, 22, 23 wall ground corners
   */

  const arr = Array(rows)
    .fill(18)
    .map(() => Array(cols).fill(18));

  let cnt = 0;
  while (cnt < 6) {
    const row = Phaser.Math.Between(2, rows - 3);
    const col = Phaser.Math.Between(2, cols - 3);
    arr[row][col] = 19;
    cnt++;
  }

  arr[1][1] = 16;
  arr[rows - 2][1] = 22;
  arr[1][cols - 2] = 17;
  arr[rows - 2][cols - 2] = 23;

  return arr;
};

export const generateWallArray = (rows: number, cols: number) => {
  /**
   * generate wall array map from assets/tiles_walls.png
   * 7 <- empty
   * 6 <- default wall
   * 5 <- wall with banner
   * 4 <- wall with window
   */

  const arr = Array(rows)
    .fill(7)
    .map(() => Array(cols).fill(7));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
        arr[i][j] = 6;
      } else if (i % 2 === 0 && j % 2 === 0) {
        arr[i][j] = 6;
      }
    }
  }

  arr[0][0] = 5;
  arr[0][cols - 1] = 5;
  arr[rows - 1][0] = 5;
  arr[rows - 1][cols - 1] = 5;

  return arr;
};
