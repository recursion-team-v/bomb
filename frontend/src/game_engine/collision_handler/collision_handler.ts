import * as Constants from '../../../../backend/src/constants/constants';
import { blastToBomb } from '../../../../backend/src/game_engine/collision_handler/blast';
import Bomb from '../../items/Bomb';

export default function collisionHandler(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) {
  /**
   * bodyA <- this のオブジェクト
   * bodyB <- 他 のオブジェクト
   */

  if (bodyA.gameObject == null || bodyB.gameObject == null) return;

  // console.log(bodyA.label, bodyB.label);

  // getData ではなく body.label
  const aType = bodyA.label as Constants.OBJECT_LABELS;
  const bType = bodyB.label as Constants.OBJECT_LABELS;

  // A = PLAYER, B = BLAST
  // サーバで判定するので不要

  // A = BLAST, B = BOMB
  if (aType === Constants.OBJECT_LABEL.BLAST && bType === Constants.OBJECT_LABEL.BOMB) {
    blastToBomb(bodyB.gameObject as Bomb);
  }
}
