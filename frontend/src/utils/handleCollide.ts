import explosionToBomb from '../../../backend/src/gameEngine/collision_handler/explosion';
import { playerToExplosion, playerToItem } from '../../../backend/src/gameEngine/collision_handler/player';
import MyPlayer from '../characters/MyPlayer';
import Bomb from '../items/Bomb';
import Item from '../items/Item';
import { ObjectTypes } from '../types/objects';

export const handleCollide = (bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
  /**
   * bodyA <- this のオブジェクト
   * bodyB <- 他 のオブジェクト
   */

  if (bodyA.gameObject == null || bodyB.gameObject == null) return;

  // console.log(bodyA.label, bodyB.label);

  // getData ではなく body.label
  const aType = bodyA.label as ObjectTypes;
  const bType = bodyB.label as ObjectTypes;

  // A = PLAYER, B = ITEM
  if (aType === ObjectTypes.PLAYER && bType === ObjectTypes.ITEM) {
    const player = bodyA.gameObject as MyPlayer;
    const item = bodyB.gameObject as Item;
    playerToItem(player, item);
  }
  // A = PLAYER, B = EXPLOSION
  else if (aType === ObjectTypes.PLAYER && bType === ObjectTypes.EXPLOSION) {
    playerToExplosion(bodyA.gameObject as MyPlayer);
    console.log('player hit explosion');
  }

  // A = EXPLOSION, B = BOMB
  else if (aType === ObjectTypes.EXPLOSION && bType === ObjectTypes.BOMB) {
    explosionToBomb(bodyB.gameObject as Bomb);
  }
};
