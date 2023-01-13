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

  // アイテムの生成時間
  @type('number')
  createdAt: number;

  // アイテムが無敵状態から解除される時間
  // ブロックを破壊した時にアイテムが出現するのだが、爆風が残ってるとアイテムが破壊されてしまうので一定時間無敵にする
  @type('number')
  notInvincibleAt: number;

  constructor(x: number, y: number, itemType: Constants.ITEM_TYPES) {
    super();
    this.id = uuidv4();
    this.x = x;
    this.y = y;
    this.itemType = itemType;
    this.createdAt = Date.now();
    this.notInvincibleAt = Date.now() + Constants.ITEM_INVINCIBLE_TIME;
  }

  removeItem() {}

  getType() {
    return this.itemType;
  }

  isInvincible() {
    return Date.now() < this.notInvincibleAt;
  }
}
