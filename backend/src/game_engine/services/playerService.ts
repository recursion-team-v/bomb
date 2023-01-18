import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import { Bomb } from '../../rooms/schema/Bomb';
import Player from '../../rooms/schema/Player';
import Item from '../../rooms/schema/Item';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class PlayerService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  deletePlayer(sessionId: string) {
    const playerBody = this.gameEngine.playerBodies.get(sessionId);
    if (playerBody === undefined) return;

    Matter.Composite.remove(this.gameEngine.world, playerBody);
    this.gameEngine.playerBodies.delete(sessionId);
    this.gameEngine.sessionIdByBodyId.delete(playerBody.id);
    this.gameEngine.state.players.delete(sessionId);
  }

  addPlayer(sessionId: string, playerName: string) {
    const player = this.gameEngine.state.createPlayer(sessionId, playerName);
    const playerBody = Matter.Bodies.rectangle(
      player.x,
      player.y,
      Constants.PLAYER_WIDTH,
      Constants.PLAYER_HEIGHT,
      {
        label: Constants.OBJECT_LABEL.PLAYER,
        chamfer: {
          radius: 10,
        },
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0,
        restitution: 0,
        inertia: Infinity,
      }
    );

    this.gameEngine.playerBodies.set(sessionId, playerBody);
    this.gameEngine.sessionIdByBodyId.set(playerBody.id, sessionId);

    Matter.Composite.add(this.gameEngine.world, [playerBody]);
    playerBody.collisionFilter.category = Constants.COLLISION_CATEGORY.PLAYER;
    playerBody.collisionFilter.mask = Constants.COLLISION_CATEGORY.DEFAULT;
  }

  updatePlayer(player: Player, deltaTime?: number) {
    const playerState = this.gameEngine.state.getPlayer(player.sessionId);
    const playerBody = this.gameEngine.playerBodies.get(player.sessionId);
    if (playerBody === undefined || playerState === undefined) return;

    let data: any;

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    while ((data = player.inputQueue.shift())) {
      const { player: playerData, inputPayload, isInput } = data;

      if (isInput === false) {
        Matter.Body.setVelocity(playerBody, { x: 0, y: 0 });
        Matter.Body.setPosition(playerBody, { x: player.x, y: player.y });
      } else {
        const velocity = player.speed;
        let vx = 0;
        let vy = 0;
        if (inputPayload.left === true) vx -= velocity;
        if (inputPayload.right === true) vx += velocity;
        if (inputPayload.up === true) vy -= velocity;
        if (inputPayload.down === true) vy += velocity;
        Matter.Body.setVelocity(playerBody, { x: vx, y: vy });
      }

      playerState.frameKey = playerData.frameKey;
    }
  }

  // プレイヤーが死亡したときに呼び出される
  diePlayer(player: Player) {
    if (player.getItemMapTotalCount() === 0) return;

    // プレイヤーが持っているアイテムを配列に格納して、シャッフルする
    const dropItemList: Constants.ITEM_TYPES[] = [];
    player.getItemMap.forEach((count, item) => dropItemList.push(...Array(count).fill(item)));
    dropItemList.sort(() => Math.random() - 0.5);

    // 現在のブロックや人、アイテムが存在しない map 取得
    const map = this.gameEngine.getMapWithoutBody();
    map.sort(() => Math.random() - 0.5);

    // プレイヤーが持っているアイテムを map の位置にランダムに配置する
    for (let i = 0; i < Math.min(map.length, dropItemList.length); i++) {
      const { x, y } = map[i];
      const item = dropItemList[i];
      this.gameEngine.room.clock.setTimeout(() => {
        this.gameEngine.itemService.addItem(
          new Item(
            Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * x,
            Constants.HEADER_HEIGHT + Constants.TILE_HEIGHT / 2 + Constants.TILE_HEIGHT * y,
            item
          )
        );
      }, Constants.ITEM_DROP_TIME_WHEN_PLAYER_DEAD);
    }
  }

  placeBomb(bomb: Bomb): boolean {
    const player = this.gameEngine.state.getPlayer(bomb.sessionId);
    if (player === undefined) return false;
    if (!player.canSetBomb()) return false;

    if (this.gameEngine.bombService.addBomb(bomb)) {
      // 爆弾を設置できたら、設置している爆弾の数を増やす
      player.increaseSetBombCount();
      return true;
    } else {
      return false;
    }
  }
}
