import * as Constants from '../../../../backend/src/constants/constants';
import { blastToBomb } from '../../../../backend/src/game_engine/collision_handler/blast';
import { playerToItem } from '../../../../backend/src/game_engine/collision_handler/player';
import MyPlayer from '../../characters/MyPlayer';
import Bomb from '../../items/Bomb';
import Item from '../../items/Item';

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

  // A = PLAYER, B = ITEM
  if (aType === Constants.OBJECT_LABEL.PLAYER && bType === Constants.OBJECT_LABEL.ITEM) {
    const player = bodyA.gameObject as MyPlayer;
    const item = bodyB.gameObject as Item;
    playerToItem(player, item);

  }
  // A = PLAYER, B = BLAST
  // サーバで判定するので不要

  // A = BLAST, B = BOMB
  else if (aType === Constants.OBJECT_LABEL.BLAST && bType === Constants.OBJECT_LABEL.BOMB) {
    blastToBomb(bodyB.gameObject as Bomb);
  }
}
