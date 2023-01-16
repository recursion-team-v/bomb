import { Schema, type } from '@colyseus/schema';
import * as Constants from '../../constants/constants';

export default class Block extends Schema {
  @type('string')
  id: string;

  @type('number')
  x: number;

  @type('number')
  y: number;

  // ブロック破壊時に生成されるアイテムのタイプ
  @type('string')
  itemType?: Constants.ITEM_TYPES;

  @type('number')
  createdAt: number;

  // ブロックが破壊される時間
  @type('number')
  removedAt: number;

  constructor(id: string, x: number, y: number, itemType?: Constants.ITEM_TYPES) {
    super();
    this.id = id;
    this.x = x;
    this.y = y;
    this.itemType = itemType;
    this.createdAt = Date.now();
    this.removedAt = Infinity;
  }

  isCreatedTime(): boolean {
    return this.createdAt <= Date.now();
  }

  isRemovedTime(): boolean {
    return this.removedAt <= Date.now();
  }
}
