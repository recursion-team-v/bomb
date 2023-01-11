import PlacementObjectInterface from '../../../backend/src/interfaces/placement_object';
import { PlayerInterface } from '../items/Bomb';

import { Bomb as ServerBomb } from '../../../backend/src/rooms/schema/Bomb';
import { getGameScene } from '../utils/globalGame';

// 爆弾を設置します
export function createBomb(bomb: PlacementObjectInterface) {
  const serverBomb = bomb as ServerBomb;
  const sessionId = serverBomb.sessionId;

  const gc = getGameScene();
  const myPlayer = gc.getCurrentPlayer();
  const otherPlayer = gc.getOtherPlayers();

  let player: PlayerInterface;
  if (myPlayer.isEqualSessionId(sessionId)) {
    player = myPlayer;
  } else {
    const op = otherPlayer.get(sessionId);
    if (op === undefined) return;
    player = op;
  }

  gc.add.bomb(
    serverBomb.id,
    sessionId,
    serverBomb.x,
    serverBomb.y,
    serverBomb.bombStrength,
    serverBomb.removedAt,
    player
  );
}
