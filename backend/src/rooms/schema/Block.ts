import { Schema, type } from '@colyseus/schema';
import * as Constants from '../../constants/constants';

export default class Block extends Schema {
  @type('string')
  id: string;

  @type('number')
  x: number;

  @type('number')
  y: number;

  // アイテムのタイプ
  @type('string')
  itemType?: Constants.ITEM_TYPES;

  constructor(id: string, x: number, y: number, itemType?: Constants.ITEM_TYPES) {
    super();
    this.id = id;
    this.x = x;
    this.y = y;
    this.itemType = itemType;
  }
}
