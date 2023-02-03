import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import Item from '../../rooms/schema/Item';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ItemService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  addItem(item: Item) {
    const itemBody = Matter.Bodies.rectangle(
      item.x,
      item.y,
      Constants.TILE_WIDTH * 0.8,
      Constants.TILE_HEIGHT * 0.8,
      {
        label: Constants.OBJECT_LABEL.ITEM,
        isSensor: true,
      }
    );

    this.gameEngine.state.items.set(item.id, item);
    this.gameEngine.itemBodies.set(item.id, itemBody);
    this.gameEngine.itemIdByBodyId.set(itemBody.id, item.id);
    Matter.Composite.add(this.gameEngine.world, itemBody);
    return itemBody;
  }

  removeItem(item: Item) {
    const itemBody = this.gameEngine.itemBodies.get(item.id);
    if (itemBody === undefined) return;
    Matter.Composite.remove(this.gameEngine.world, itemBody);
    this.gameEngine.itemBodies.delete(item.id);
    this.gameEngine.itemIdByBodyId.delete(itemBody.id);
    this.gameEngine.state.items.delete(item.id);
  }
}
