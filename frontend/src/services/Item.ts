import ServerItem from '../../../backend/src/rooms/schema/Item';
import { getGameScene } from '../utils/globalGame';

// アイテムが破壊・習得されたらアイテムを削除する
export function removeItem(item: ServerItem) {
  const game = getGameScene();
  const id = item.id;

  const currItems = game.getCurrItems();
  if (currItems === undefined) return;

  const itemBody = currItems.get(id);
  if (itemBody === undefined) return;
  currItems.delete(id);
  itemBody.removeItem();
}
