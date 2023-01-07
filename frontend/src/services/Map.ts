import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';

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
