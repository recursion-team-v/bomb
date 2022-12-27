import MyPlayer from '../characters/MyPlayer';
import Item from '../items/Item';
import { ItemTypes } from '../types/items';
import { ObjectTypes } from '../types/objects';

export const handleCollide = (bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
  /**
   * bodyA <- this のオブジェクト
   * bodyB <- 他 のオブジェクト
   */

  if (bodyA.gameObject == null || bodyB.gameObject == null) return;

  console.log(bodyA.label, bodyB.label);

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
        item.destroy();
        break;

      case ItemTypes.PLAYER_SPEED:
        player.setSpeed(player.speed + 1);
        item.destroy();
        break;

      default:
        break;
    }
  }
  // A = PLAYER, B = EXPLOSION
  else if (aType === ObjectTypes.PLAYER && bType === ObjectTypes.EXPLOSION) {
    console.log('player hit explosion');
  }
};