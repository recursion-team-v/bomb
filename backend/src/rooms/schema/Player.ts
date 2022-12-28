import { Schema, type } from '@colyseus/schema';

export default class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") vx: number;
  @type("number") vy: number;
}
