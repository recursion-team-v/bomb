import { Schema, type } from '@colyseus/schema';
import { v4 as uuidv4 } from 'uuid';
import { ITEM_TYPES } from '../../constants/constants';

export default class Item extends Schema {
  @type('string')
  id: string;

  // プレイヤーの位置
  @type('number')
  x: number;

  @type('number')
  y: number;

  // アイテムのタイプ
  @type('string')
  itemType: string;

  constructor(x: number, y: number, itemType: ITEM_TYPES) {
    super();
    this.id = uuidv4();
    this.x = x;
    this.y = y;
    this.itemType = itemType;
  }
}
