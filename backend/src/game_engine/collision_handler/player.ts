import * as Constants from '../../constants/constants';
import ItemInterface from '../../interfaces/item';
import PlayerInterface from '../../interfaces/player';

export function playerToItem(player: PlayerInterface, item: ItemInterface) {
  switch (item.getType()) {
    case Constants.ITEM_TYPE.BOMB_STRENGTH:
      player.setBombStrength(player.getBombStrength() + 1);
      break;

    case Constants.ITEM_TYPE.PLAYER_SPEED:
      player.setSpeed(player.getSpeed() + 1);
      break;

    case Constants.ITEM_TYPE.BOMB_POSSESSION_UP:
      player.increaseMaxBombCount();
      break;

    default:
      return;
  }

  item.removeItem();
}
