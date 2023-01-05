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

  createRandomItems(rows: number, cols: number) {
    const items = [];
    for (let x = 2; x < cols - 1; x += 2) {
      for (let y = 2; y < rows; y += 2) {
        const index = Math.floor(Math.random() * 6);
        if (index === 1)
          items.push(
            this.addItem(
              this.gameEngine.state.createItem(x, y, Constants.ITEM_TYPE.BOMB_POSSESSION_UP)
            )
          );
        else if (index === 2)
          items.push(
            this.addItem(this.gameEngine.state.createItem(x, y, Constants.ITEM_TYPE.BOMB_STRENGTH))
          );
        else if (index === 3)
          items.push(
            this.addItem(this.gameEngine.state.createItem(x, y, Constants.ITEM_TYPE.PLAYER_SPEED))
          );
      }
    }
    Matter.Composite.add(this.gameEngine.world, items);
  }

  addItem(item: Item) {
    const itemBody = Matter.Bodies.rectangle(
      item.x,
      item.y,
      Constants.TILE_WIDTH,
      Constants.TILE_HEIGHT,
      {
        label: item.itemType,
      }
    );
    this.gameEngine.itemBodies.set(item.id, itemBody);
    return itemBody;
  }

  removeItem(item: Item) {
    const itemBody = this.gameEngine.itemBodies.get(item.id);
    if (itemBody === undefined) return;
    Matter.Composite.remove(this.gameEngine.world, itemBody);
    this.gameEngine.bombBodies.delete(item.id);
  }
}
