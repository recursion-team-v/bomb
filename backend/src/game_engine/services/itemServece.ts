import { ITEM_PLACE_COUNT } from './../../constants/constants';
import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import Item from '../../rooms/schema/Item';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ItemServece {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  createRandomItems(rows: number, cols: number) {
    const items = [];
    let bombPossessionUpCnt = 0;
    let bombStrengthCnt = 0;
    let playerSpeedCnt = 0;
    for (let x = 2; x < cols - 1; x += 2) {
      for (let y = 2; y < rows; y += 2) {
        const index = Math.floor(Math.random() * 4);
        if (index === 1 && Constants.ITEM_PLACE_COUNT.BOMB_POSSESSION_UP > bombPossessionUpCnt) {
          items.push(
            this.addItem(
              this.gameEngine.state.createItem(x, y, Constants.ITEM_TYPE.BOMB_POSSESSION_UP)
            )
          );
          bombPossessionUpCnt++;
        } else if (index === 2 && Constants.ITEM_PLACE_COUNT.BOMB_STRENGTH > bombStrengthCnt) {
          items.push(
            this.addItem(this.gameEngine.state.createItem(x, y, Constants.ITEM_TYPE.BOMB_STRENGTH))
          );
          bombStrengthCnt++;
        } else if (index === 3 && ITEM_PLACE_COUNT.PLAYER_SPEED > playerSpeedCnt) {
          items.push(
            this.addItem(this.gameEngine.state.createItem(x, y, Constants.ITEM_TYPE.PLAYER_SPEED))
          );
          playerSpeedCnt++;
        }
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
        label: Constants.OBJECT_LABEL.ITEM,
        isStatic: true,
        isSensor: true,
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
