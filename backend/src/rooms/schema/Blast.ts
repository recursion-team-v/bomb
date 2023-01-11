import { Schema, type } from '@colyseus/schema';

export default class Blast extends Schema {
  @type('string')
  id: string;

  // 位置
  @type('number')
  x: number;

  @type('number')
  y: number;

  constructor(id: string, x: number, y: number) {
    super();
    this.id = id;
    this.x = x;
    this.y = y;
  }
}
