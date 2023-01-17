import * as Constants from '../../../../backend/src/constants/constants';
import { blastToBomb } from '../../../../backend/src/game_engine/collision_handler/blast';
import Bomb from '../../items/Bomb';
import { getGameScene } from '../../utils/globalGame';

export default function collisionHandler(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) {
  /**
   * bodyA <- this のオブジェクト
   * bodyB <- 他 のオブジェクト
   */

  if (bodyA.gameObject == null || bodyB.gameObject == null) return;

  // getData ではなく body.label
  const aType = bodyA.label as Constants.OBJECT_LABELS;
  const bType = bodyB.label as Constants.OBJECT_LABELS;

  // A = PLAYER, B = BLAST
  // サーバで判定するので不要

  // A = BLAST, B = BOMB
  if (aType === Constants.OBJECT_LABEL.BLAST && bType === Constants.OBJECT_LABEL.BOMB) {
    blastToBomb(bodyB.gameObject as Bomb, bodyB.gameObject.id);
  }

  // A = PLAYER, B = ITEM
  // アイテム取得時に音を鳴らす
  if (aType === Constants.OBJECT_LABEL.PLAYER && bType === Constants.OBJECT_LABEL.ITEM) {
    const game = getGameScene();
    if (game == null) return;
    game.getSeItemGet().play();
  }
}
