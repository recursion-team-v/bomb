/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Room } from 'colyseus';
import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import collisionHandler from '../game_engine/collision_handler/collision_handler';
import BombService from '../game_engine/services/bombService';
import EnemyService from '../game_engine/services/enemyService';
import ItemService from '../game_engine/services/ItemService';
import MapService from '../game_engine/services/mapService';
import PlayerService from '../game_engine/services/playerService';
import { Bomb } from './schema/Bomb';
import GameRoomState from './schema/GameRoomState';
import Player from './schema/Player';

export default class GameEngine {
  world: Matter.World;
  room: Room<GameRoomState>;
  state: GameRoomState;
  engine: Matter.Engine;

  playerBodies = new Map<string, Matter.Body>();

  // 衝突判定時に、衝突した bodyId から player の sessionId を取得し player を取得するために利用
  sessionIdByBodyId = new Map<number, string>();

  bombBodies = new Map<string, Matter.Body>();
  // 衝突判定時に、衝突した bodyId から bombId を取得し bomb を取得するために利用
  bombIdByBodyId = new Map<number, string>(); // bodyId: bombId
  itemIdByBodyId = new Map<number, string>();

  itemBodies = new Map<string, Matter.Body>();

  blockBodies = new Map<string, Matter.Body>();

  bombService: BombService;
  playerService: PlayerService;
  enemyService: EnemyService;
  mapService: MapService;
  itemService: ItemService;

  constructor(room: Room<GameRoomState>) {
    this.engine = Matter.Engine.create();
    this.room = room;
    this.state = room.state;
    this.world = this.engine.world;

    this.engine.gravity.y = 0;
    this.bombService = new BombService(this);
    this.playerService = new PlayerService(this);
    this.enemyService = new EnemyService(this);
    this.mapService = new MapService(this);
    this.itemService = new ItemService(this);

    this.init();
  }

  init() {
    // create map
    this.mapService.createMapWalls(this.state.gameMap.rows, this.state.gameMap.cols);
    this.mapService.createMapBlocks(
      this.state.gameMap.rows,
      this.state.gameMap.cols,
      this.state.gameMap.blockArr
    );

    this.initUpdateEvents();
    this.initCollision();
  }

  initUpdateEvents() {
    Matter.Events.on(this.engine, 'afterUpdate', () => {
      for (const key of this.playerBodies.keys()) {
        const playerState = this.state.getPlayer(key);
        const playerBody = this.playerBodies.get(key);
        if (!playerState || !playerBody) continue;

        playerState.x = playerBody.position.x;
        playerState.y = playerBody.position.y;
        playerState.vx = playerBody.velocity.x;
        playerState.vy = playerBody.velocity.y;
      }
    });
  }

  initCollision() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => collisionHandler(this, pair.bodyA, pair.bodyB));
    });
  }

  getPlayer(sessionId: string): Player | undefined {
    return this.state.players.get(sessionId);
  }

  // matter world 上の body から、二次元配列のマップを作成します
  // この時 fn で指定した関数を実行し、その結果をマップに反映します
  getDimensionalMap(fn: (bodies: Matter.Body[]) => any): number[][] {
    const dimensionalMap: number[][] = [];

    for (let y = 0; y < this.state.gameMap.rows; y++) {
      dimensionalMap[y] = [];
      for (let x = 0; x < this.state.gameMap.cols; x++) {
        const bodies = Matter.Query.point(this.world.bodies, {
          x: Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * x,
          y: Constants.HEADER_HEIGHT + Constants.TILE_HEIGHT / 2 + Constants.TILE_HEIGHT * y,
        });
        dimensionalMap[y][x] = fn(bodies);
      }
    }

    return dimensionalMap;
  }

  // matter bodies から label を確認し、最も優先度の高い判定を返す
  getHighestPriorityFromBodies(bodies: Matter.Body[]): number {
    let highestPriority = Constants.OBJECT_COLLISION_TO_BLAST.NONE as number;
    if (bodies.length === 0) return highestPriority;

    const hash = { ...Constants.OBJECT_COLLISION_TO_BLAST };

    bodies.forEach((body) => {
      const label = body.label as Constants.OBJECT_LABELS;
      highestPriority = Math.max(highestPriority, hash[label]);
    });

    return highestPriority;
  }

  // matter bodies が存在するかどうかを判定し、存在する場合は 1 を返す
  getHasBody(bodies: Matter.Body[]): number {
    return bodies.length === 0 ? 0 : 1;
  }

  // 移動できるかどうかを判定し、移動できる場合は 2 / 破壊すれば移動できる場合は 1 / 移動できない場合は 0 を返す
  checkMovable(bodies: Matter.Body[]): number {
    let highestPriority = Constants.OBJECT_IS_MOVABLE.NONE as number;
    if (bodies.length === 0) return highestPriority;

    const hash = { ...Constants.OBJECT_IS_MOVABLE };

    bodies.forEach((body) => {
      const label = body.label as Constants.OBJECT_LABELS;
      highestPriority = Math.min(highestPriority, hash[label]);
    });

    return highestPriority;
  }

  // 移動できるかどうかを判定し、移動できる場合は true を返す
  isMovable(n: number): boolean {
    return n === 0;
  }

  // matter bodies に bomb が存在するかどうかを判定し、
  // ボムが存在する場合は Bomb をそれ以外は undefined を返す
  HasBomb(bodies: Matter.Body[]): Bomb | undefined {
    for (const body of bodies) {
      if (body.label === Constants.OBJECT_LABEL.BOMB) {
        const bombId = this.bombIdByBodyId.get(body.id);
        if (bombId === undefined) return undefined;
        return this.state.bombs.get(bombId);
      }
    }
    return undefined;
  }

  // matter bodies に blast が存在するかどうかを判定し、
  // blast が存在する場合は true をそれ以外は false を返す
  HasBlast(bodies: Matter.Body[]): boolean {
    return bodies.some((body) => body.label === Constants.OBJECT_LABEL.BLAST);
  }

  // matter bodies に item が存在するかどうかを判定し、
  // item が存在する場合は 1 それ以外は 0 を返す
  HasItem(bodies: Matter.Body[]): number {
    for (const body of bodies) {
      if (body.label === Constants.OBJECT_LABEL.ITEM) return 1;
    }
    return 0;
  }

  // matter bodies に block が存在するかどうかを判定し、
  // block が存在する場合は 1 それ以外は 0 を返す
  HasBlock(bodies: Matter.Body[]): number {
    for (const body of bodies) {
      if (body.label === Constants.OBJECT_LABEL.BLOCK) return 1;
    }
    return 0;
  }
}
