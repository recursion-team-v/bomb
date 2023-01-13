import GameEngine from '../../rooms/GameEngine';
import * as Constants from '../../constants/constants';
import { getWallArr, spiralOrder } from '../../utils/map';
import Matter from 'matter-js';

export default function dropWalls(engine: GameEngine) {
  const clock = engine.room.clock;
  const walls = getWallArr();
  const spiralOrderWalls = spiralOrder(walls);

  // 一定時間ごとに壁を落とす
  clock.setInterval(() => {
    const wallIdx = spiralOrderWalls.shift();
    if (wallIdx !== undefined) dropWall(engine, wallIdx);
  }, Constants.DROP_WALL_DURATION);
}

function dropWall(engine: GameEngine, wallIndex: number) {
  // 新しい壁を生成する
  const x = wallIndex % (Constants.TILE_COLS - 2);
  const y = Math.floor(wallIndex / (Constants.TILE_COLS - 2));

  const newWall = Matter.Bodies.rectangle(
    Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * (x + 1),
    Constants.HEADER_HEIGHT + Constants.TILE_HEIGHT / 2 + Constants.TILE_HEIGHT * (y + 1),
    Constants.TILE_WIDTH,
    Constants.TILE_HEIGHT,
    {
      label: Constants.OBJECT_LABEL.DROP_WALL,
      isStatic: true,
    }
  );

  Matter.Composite.add(engine.world, newWall);
}
