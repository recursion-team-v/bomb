/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import BombService from '../gameEngine/bombService';
import PlayerService from '../gameEngine/playerService';
import WallService from '../gameEngine/wallService';
import GameRoomState from './schema/GameRoomState';

export default class GameEngine {
  world: Matter.World;
  state: GameRoomState;
  engine: Matter.Engine;

  playerBodies = new Map<string, Matter.Body>();
  bombBodies = new Map<string, Matter.Body>();
  bombService: BombService;
  playerService: PlayerService;
  wallService: WallService;

  constructor(state: GameRoomState) {
    this.engine = Matter.Engine.create();
    this.state = state;
    this.world = this.engine.world;

    this.engine.gravity.y = 0;
    this.bombService = new BombService(this);
    this.playerService = new PlayerService(this);
    this.wallService = new WallService(this);

    this.init();
  }

  init() {
    // create walls
    this.wallService.addWalls(Constants.TILE_ROWS, Constants.TILE_COLS);
    this.initUpdateEvents();
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

  initCollision() {}
}
