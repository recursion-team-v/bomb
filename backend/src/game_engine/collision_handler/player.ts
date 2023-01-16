/* eslint-disable no-case-declarations */
import * as Constants from '../../constants/constants';
import Player from '../../rooms/schema/Player';
import GameEngine from '../../rooms/GameEngine';
import Item from '../../rooms/schema/Item';

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

    case Constants.ITEM_TYPE.THROUGH_BLOCK:
      // 既にThroughBlockを取得済みの場合は無視
      if (player.getCanThroughBlock()) break;

      const playerBody = engine.playerBodies.get(player.sessionId);
      if (playerBody === undefined) return;
      const mask = playerBody.collisionFilter.mask;
      if (mask === undefined) return;
      // ブロックとの衝突を無視させる
      player.setCanThroughBlock();
      playerBody.collisionFilter.mask = mask ^ Constants.COLLISION_CATEGORY.BLOCK;
      break;

    default:
  }

  // アイテムを取得済みにする
  item.setObtained();

  // アイテムを削除するキューに入れる
  engine.state.getItemToDestroyQueue().enqueue(item);
}
