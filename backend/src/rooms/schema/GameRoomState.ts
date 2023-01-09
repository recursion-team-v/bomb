import { ITEM_TYPES } from './../../constants/constants';
import { MapSchema, Schema, type } from '@colyseus/schema';

import * as Constants from '../../constants/constants';
import GameQueue from '../../utils/gameQueue';
import { Bomb, getSettablePosition } from './Bomb';
import GameState from './GameState';
import Timer from './Timer';
import Player from './Player';
import Map from './Map';
import Item from './Item';
import Block from './Block';

export default class GameRoomState extends Schema {
  @type(GameState)
  gameState: GameState = new GameState();

  @type(Timer)
  readonly timer = new Timer();

  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Bomb }) bombs = new MapSchema<Bomb>();
  @type({ map: Item }) items = new MapSchema<Item>();
  @type({ map: Block }) blocks = new MapSchema<Block>();

  private readonly bombQueue: GameQueue<Bomb> = new GameQueue<Bomb>();

  @type(Map) gameMap = new Map();

  getPlayer(sessionId: string): Player | undefined {
    return this.players.get(sessionId);
  }

  getPlayersCount() {
    return this.players.size;
  }

  setTimer() {
    this.timer.set(Date.now());
  }

  createPlayer(sessionId: string): Player {
    const player = new Player(sessionId, this.getPlayersCount());
    const idx = this.getPlayersCount();
    player.idx = idx;
    player.x = Constants.INITIAL_PLAYER_POSITION[idx].x;
    player.y = Constants.INITIAL_PLAYER_POSITION[idx].y;
    this.players.set(sessionId, player);
    return player;
  }

  createBomb(player: Player, x: number, y: number, bombStrength: number): Bomb {
    const { bx, by } = getSettablePosition(player.x, player.y);
    const bomb = new Bomb(bx, by, bombStrength, player.sessionId);
    this.bombs.set(bomb.id, bomb);
    return bomb;
  }

  deleteBomb(bomb: Bomb) {
    this.bombs.delete(bomb.id);
  }

  getBombQueue(): GameQueue<Bomb> {
    return this.bombQueue;
  }

  createItem(x: number, y: number, itemType: ITEM_TYPES) {
    const item = new Item(x, y, itemType);
    this.items.set(item.id, item);
    return item;
  }

  deleteItem(item: Item) {
    this.items.delete(item.id);
  }
}
