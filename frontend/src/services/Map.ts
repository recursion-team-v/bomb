import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';
import { getGameScene } from '../utils/globalGame';

// matter world 上の body から、二次元配列のマップを作成します
// この時 fn で指定した関数を実行し、その結果をマップに反映します
export function getDimensionalMap(
  rows: number,
  cols: number,
  scene: Phaser.Scene,
  fn: (bodies: Phaser.Types.Physics.Matter.MatterBody[]) => number
): number[][] {
  const mp = new Phaser.Physics.Matter.MatterPhysics(scene);
  const dimensionalMap: number[][] = [];

  for (let y = 0; y < rows; y++) {
    dimensionalMap[y] = [];
    for (let x = 0; x < cols; x++) {
      const bodies = mp.intersectPoint(
        Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * x,
        Constants.HEADER_HEIGHT + Constants.TILE_HEIGHT / 2 + Constants.TILE_HEIGHT * y,
        scene.matter.world.getAllBodies()
      );
      dimensionalMap[y][x] = fn(bodies);
    }
  }

  return dimensionalMap;
}

// matter bodies から label を確認し、最も優先度の高い判定を返す
export function getHighestPriorityFromBodies(
  bodies: Phaser.Types.Physics.Matter.MatterBody[]
): number {
  let highestPriority = Constants.OBJECT_COLLISION_TO_BLAST.NONE as number;
  if (bodies.length === 0) return highestPriority;

  const hash = { ...Constants.OBJECT_COLLISION_TO_BLAST };

  bodies.forEach((body) => {
    const bodyType = body as MatterJS.BodyType;
    const label = bodyType.label as Constants.OBJECT_LABELS;
    highestPriority = Math.max(highestPriority, hash[label]);
  });

  return highestPriority;
}

export function dropWalls() {
  const game = getGameScene();
  const tweenTimeline = game.tweens.createTimeline();

  // 現在のマップのうち壁の内側の部分を取得
  const walls = getWallArr();

  // その部分を螺旋状に並べ替える
  const spiralOrderWall = spiralOrder(walls);

  // 並べ替えた部分を順番に落とす
  for (let i = 0; i < spiralOrderWall.length; i++) {
    const x = spiralOrderWall[i] % (Constants.TILE_COLS - 2);
    const y = Math.floor(spiralOrderWall[i] / (Constants.TILE_COLS - 2));
    const wall = game.add.outerWall(
      Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * (x + 1),
      Constants.HEADER_HEIGHT + Constants.TILE_HEIGHT / 2 + Constants.TILE_HEIGHT * (y + 1) - 1000,
      13
    );
    wall.setDepth(Infinity);
    wall.setSensor(true);

    tweenTimeline.add({
      targets: wall,
      y: `+=1000`,
      duration: 200,
      repeat: 0,
      onStart: () => {
        game.add
          .ellipse(
            Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * (x + 1),
            Constants.HEADER_HEIGHT + Constants.TILE_HEIGHT / 2 + Constants.TILE_HEIGHT * (y + 1),
            Constants.TILE_WIDTH * 0.8,
            Constants.TILE_HEIGHT * 0.4,
            Constants.BLACK,
            0.3
          )
          .setDepth(20);
      },
      onComplete: () => {
        wall.setSensor(false);
      },
    });
  }
  tweenTimeline.play();
}

function getWallArr(): number[][] {
  const walls: number[][] = [];
  for (let y = 0; y < Constants.TILE_ROWS - 2; y++) {
    for (let x = 0; x < Constants.TILE_COLS - 2; x++) {
      if (walls[y] === undefined) walls[y] = [];
      walls[y].push(x + (Constants.TILE_COLS - 2) * y);
    }
  }
  return walls;
}

function spiralOrder(matrix: number[][]) {
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
