import { Schema, type } from '@colyseus/schema';
import { v4 as uuidv4 } from 'uuid';
import * as Constants from '../../constants/constants';

export default class Item extends Schema {
  @type('string')
  id: string;

  // アイテムーの位置
  @type('number')
  x: number;

  @type('number')
  y: number;

  // アイテムのタイプ
  @type('string')
  itemType: Constants.ITEM_TYPES;

  constructor(x: number, y: number, itemType: Constants.ITEM_TYPES) {
    super();
    this.id = uuidv4();
    this.x = x;
    this.y = y;
    this.itemType = itemType;
  }

  removeItem() {}

  getType() {
    return this.itemType;
  }
}
