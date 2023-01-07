/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import Matter from 'matter-js';

import collisionHandler from '../game_engine/collision_handler/collision_handler';
import BombService from '../game_engine/services/bombService';
import MapService from '../game_engine/services/mapService';
import PlayerService from '../game_engine/services/playerService';
import GameRoomState from './schema/GameRoomState';
import ItemService from '../game_engine/services/ItemService';

export default class GameEngine {
  world: Matter.World;
  state: GameRoomState;
  engine: Matter.Engine;

  playerBodies = new Map<string, Matter.Body>();

  // 衝突判定時に、衝突した bodyId から player の sessionId を取得し player を取得するために利用
  sessionIdByBodyId = new Map<number, string>();

  bombBodies = new Map<string, Matter.Body>();
  // 衝突判定時に、衝突した bodyId から bombId を取得し bomb を取得するために利用
  bombIdByBodyId = new Map<number, string>(); // bodyId: bombId

  itemBodies = new Map<string, Matter.Body>();
  bombService: BombService;
  playerService: PlayerService;
  mapService: MapService;
  itemService: ItemService;

  constructor(state: GameRoomState) {
    this.engine = Matter.Engine.create();
    this.state = state;
    this.world = this.engine.world;

    this.engine.gravity.y = 0;
    this.bombService = new BombService(this);
    this.playerService = new PlayerService(this);
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

        // console.log(playerState.x, playerState.y);
      }
    });
  }

  initCollision() {
    Matter.Events.on(this.engine, 'collisionActive', (event) => {
      event.pairs.forEach((pair) => collisionHandler(this, pair.bodyA, pair.bodyB));
    });
  }
}
