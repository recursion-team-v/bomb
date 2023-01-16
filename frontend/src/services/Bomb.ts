import PlacementObjectInterface from '../../../backend/src/interfaces/placement_object';
import * as Constants from '../../../backend/src/constants/constants';
import { Bomb as ServerBomb } from '../../../backend/src/rooms/schema/Bomb';
import { getGameScene } from '../utils/globalGame';

// 爆弾を設置します
export function createBomb(bomb: PlacementObjectInterface) {
  const serverBomb = bomb as ServerBomb;
  const sessionId = serverBomb.sessionId;

  const gc = getGameScene();

  // すでに爆弾が設置されている場合は何もしない
  const bodies = gc.matter.intersectPoint(serverBomb.x, serverBomb.y);
  for (let i = 0; i < bodies.length; i++) {
    const bodyType = bodies[i] as MatterJS.BodyType;
    if (bodyType.label === Constants.OBJECT_LABEL.BOMB) {
      return;
    }
  }

  if (serverBomb.bombType === Constants.BOMB_TYPE.NORMAL) {
    gc.add.bomb(
      serverBomb.id,
      sessionId,
      serverBomb.x,
      serverBomb.y,
      serverBomb.bombType,
      serverBomb.bombStrength,
      serverBomb.removedAt
    );
  }

  if (serverBomb.bombType === Constants.BOMB_TYPE.PENETRATION) {
    gc.add.penetrationBomb(
      serverBomb.id,
      sessionId,
      serverBomb.x,
      serverBomb.y,
      serverBomb.bombType,
      serverBomb.bombStrength,
      serverBomb.removedAt
    );
  }
}
