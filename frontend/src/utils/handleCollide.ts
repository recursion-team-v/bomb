import MyPlayer from '../characters/MyPlayer';
import Item from '../items/Item';
import { ItemTypes } from '../types/items';
import { ObjectTypes } from '../types/objects';

export const handleCollide = (data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
  const { bodyA, bodyB } = data;
  if (bodyA.gameObject == null || bodyB.gameObject == null) return;

  console.log(bodyA.label, bodyB.label);

  // getData ではなく body.label
  const aType = bodyA.label as ObjectTypes;
  const bType = bodyB.label as ObjectTypes;

  // console.log した限りいつも A = PLAYER, B = ITEM
  // ただ、A = ITEM で B = PLAYER の場合も考慮する必要があるかも
  if (
    (aType === ObjectTypes.PLAYER && bType === ObjectTypes.ITEM) ||
    (aType === ObjectTypes.ITEM && bType === ObjectTypes.PLAYER)
  ) {
    // 可読性かなり悪い...
    let player: MyPlayer;
    let item: Item;
    if (aType === ObjectTypes.PLAYER && bType === ObjectTypes.ITEM) {
      player = bodyA.gameObject as MyPlayer;
      item = bodyB.gameObject as Item;
    } else {
      player = bodyB.gameObject as MyPlayer;
      item = bodyA.gameObject as Item;
    }

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
