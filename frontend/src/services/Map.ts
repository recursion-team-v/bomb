import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';
import { getGameScene } from '../utils/globalGame';
import { spiralOrder, getWallArr } from '../../../backend/src/utils/map';

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

  const height = 1000;
  const frame = 13;
  // 並べ替えた部分を順番に落とす
  for (let i = 0; i < spiralOrderWall.length; i++) {
    const x = spiralOrderWall[i] % (Constants.TILE_COLS - 2);
    const y = Math.floor(spiralOrderWall[i] / (Constants.TILE_COLS - 2));
    const wall = game.add.dropWall(
      Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * (x + 1),
      Constants.HEADER_HEIGHT +
        Constants.TILE_HEIGHT / 2 +
        Constants.TILE_HEIGHT * (y + 1) -
        height,
      frame
    );

    tweenTimeline.add({
      targets: wall,
      y: `+=${height}`,
      duration: Constants.DROP_WALL_DURATION,
      repeat: 0,
      onStart: () => {
        const shadow = game.add
          .ellipse(
            Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * (x + 1),
            Constants.HEADER_HEIGHT + Constants.TILE_HEIGHT / 2 + Constants.TILE_HEIGHT * (y + 1),
            Constants.TILE_WIDTH * 0.8,
            Constants.TILE_HEIGHT * 0.4,
            Constants.BLACK,
            0.3
          )
          .setDepth(Constants.OBJECT_DEPTH.DROP_WALL_SHADOW);

        // 処理落ちするので不要な shadow を消す
        setTimeout(() => {
          shadow.destroy();
        }, Constants.DROP_WALL_DURATION);
      },
      onComplete: () => {
        wall.setSensor(false);
      },
    });
  }
  tweenTimeline.play();
}
