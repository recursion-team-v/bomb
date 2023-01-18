import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import Item from '../../rooms/schema/Item';
import Player from '../../rooms/schema/Player';

export function playerToItem(player: Player, item: Item, engine: GameEngine) {
  // 既に取得済みのアイテムは無視
  if (item.getObtained()) return;

  switch (item.getType()) {
    case Constants.ITEM_TYPE.BOMB_STRENGTH:
      player.setBombStrength(player.getBombStrength() + Constants.ITEM_INCREASE_RATE.BOMB_STRENGTH);
      break;

    case Constants.ITEM_TYPE.PLAYER_SPEED:
      player.setSpeed(player.getSpeed() + Constants.ITEM_INCREASE_RATE.PLAYER_SPEED);
      break;

    case Constants.ITEM_TYPE.BOMB_POSSESSION_UP:
      player.increaseMaxBombCount(Constants.ITEM_INCREASE_RATE.BOMB_POSSESSION_UP);
      break;

    case Constants.ITEM_TYPE.HEART:
      player.healed(Constants.ITEM_INCREASE_RATE.HEART);
      break;

    case Constants.ITEM_TYPE.PENETRATION_BOMB:
      player.setBombType(Constants.BOMB_TYPE.PENETRATION);
      break;

    default:
  }

  // アイテムを取得済みにする
  item.setObtained();

  // アイテムを削除するキューに入れる
  engine.state.getItemToDestroyQueue().enqueue(item);
}
