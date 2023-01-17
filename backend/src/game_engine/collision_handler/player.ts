import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import Item from '../../rooms/schema/Item';
import Player from '../../rooms/schema/Player';

export function playerToItem(player: Player, item: Item, engine: GameEngine) {
  // 既に取得済みのアイテムは無視
  if (item.getObtained()) return;

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

    case Constants.ITEM_TYPE.HEART:
      player.healed(1);
      break;

    case Constants.ITEM_TYPE.PENETRATION_BOMB:
      player.setBombType(Constants.BOMB_TYPE.PENETRATION);
      break;

    default:
      return;
  }

  // アイテムを取得済みにする
  item.setObtained();

  // アイテム取得履歴の追加
  player.incrementItem(item.itemType);

  // アイテムを削除するキューに入れる
  engine.state.getItemToDestroyQueue().enqueue(item);
}
