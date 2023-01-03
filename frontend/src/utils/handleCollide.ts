import MyPlayer from '../characters/MyPlayer';
import Bomb from '../items/Bomb';
import Item from '../items/Item';
import { ItemTypes } from '../types/items';
import { ObjectTypes } from '../types/objects';
import * as Constants from '../../../backend/src/constants/constants';

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

    switch (item.itemType) {
      case ItemTypes.BOMB_STRENGTH:
        player.setBombStrength(player.bombStrength + 1);
        break;

      case ItemTypes.PLAYER_SPEED:
        player.setSpeed(player.speed + 1);
        break;

      case ItemTypes.BOMB_POSSESSION_UP:
        player.increaseMaxBombCount();
        break;

      default:
        return;
    }
    item.removeItem();
  }
  // A = PLAYER, B = EXPLOSION
  else if (aType === ObjectTypes.PLAYER && bType === ObjectTypes.EXPLOSION) {
    console.log('player hit explosion');
  }

  // A = EXPLOSION, B = BOMB
  else if (aType === ObjectTypes.EXPLOSION && bType === ObjectTypes.BOMB) {
    const bomb = bodyB.gameObject as Bomb;

    bomb.scene.time.addEvent({
      delay: Constants.BOMB_DETONATION_DELAY,
      callback: () => {
        if (bodyB === null) return;
        bomb.explode();
        bomb.afterExplosion();
      },
    });
  }
};
