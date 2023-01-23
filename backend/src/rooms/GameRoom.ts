import { Client, Room } from 'colyseus';
import Matter from 'matter-js';

import * as Constants from '../constants/constants';
import dropWalls from '../game_engine/services/dropWallService';
import PlacementObjectInterface from '../interfaces/placement_object';
import {
  directMovableMap,
  getDirectMovableMapIfBombSet,
  getHighestPriorityTile,
  influenceToOtherTile,
  isSelfDie,
  normalizeDimension,
  numberOfDestroyableBlock,
  reverseNormalizeDimension,
  searchPath,
  sumOfProductsSynthesis,
  treatLevelMapByBomb,
} from '../utils/calc';
import GameQueue from '../utils/gameQueue';
import GameEngine from './GameEngine';
import Block from './schema/Block';
import { Bomb } from './schema/Bomb';
import Enemy from './schema/Enemy';
import GameRoomState from './schema/GameRoomState';
import Item from './schema/Item';
import Player from './schema/Player';

export default class GameRoom extends Room<GameRoomState> {
  engine!: GameEngine;
  private IsFinishedDropWallsEvent: boolean = false;
  private readonly enemies = new Map<string, Enemy>();

  onCreate(options: any) {
    // ルームで使用する時計
    this.clock.start();

    this.setState(new GameRoomState());
    this.engine = new GameEngine(this);

    for (let i = 0; i < Constants.DEBUG_DEFAULT_ENEMY_COUNT; i++) {
      const enemy = this.engine.enemyService.addEnemy(`enemy-${i}`);
      this.enemies.set(`enemy-${i}`, enemy);
    }

    // ゲーム開始をクライアントから受け取る
    this.onMessage(Constants.NOTIFICATION_TYPE.GAME_PROGRESS, (client, data) => {
      this.gameStartEvent();
    });

    // ゲーム開始の情報をクライアントに送る
    // FIXME: ロビーが入ったら変わるはずなので一時凌ぎ
    this.onMessage(Constants.NOTIFICATION_TYPE.GAME_START_INFO, (client, data) => {
      client.send(Constants.NOTIFICATION_TYPE.GAME_START_INFO, this.state.timer);
    });

    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_INFO, (client, data: any) => {
      const player = this.state.getPlayer(client.sessionId);
      if (player === undefined) return;
      player?.setPlayerName(data);
    });

    // クライアントからの移動入力を受け取ってキューに詰める
    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, (client, data: any) => {
      // get reference to the player who sent the message
      const player = this.state.getPlayer(client.sessionId);
      if (player === undefined) return;

      // 既に死んでいたら無視
      if (player.isDead()) return;

      player.inputQueue.push(data);
    });

    // TODO:クライアントからのボム設置入力を受け取ってキューに詰める
    this.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_BOMB, (client) => {
      // キューに詰める
      const player = this.state.getPlayer(client.sessionId);
      if (player === undefined) return;
      this.engine.bombService.enqueueBomb(player);
    });

    // FRAME_RATE ごとに fixedUpdate を呼ぶ
    let elapsedTime: number = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      this.state.timer.updateNow();
      this.timeEventHandler();
      this.enemyHandler();

      while (elapsedTime >= Constants.FRAME_RATE) {
        this.state.timer.updateNow();

        // 時間切れになったらゲーム終了
        if (!this.state.timer.isInTime() && this.state.gameState.isPlaying()) {
          try {
            this.state.gameState.setFinished();
          } catch (e) {
            console.error(e);
          }
          return;
        }

        elapsedTime -= Constants.FRAME_RATE;

        for (const [, player] of this.state.players) {
          if (this.enemies.get(player.sessionId) === undefined) {
            this.engine.playerService.updatePlayer(player);
          } else {
            this.engine.enemyService.updateEnemy(player as Enemy);
          }
        }

        // 爆弾の衝突判定の更新（プレイヤーが降りた場合は判定を変える)
        this.engine.bombService.updateBombCollision();

        // 爆弾の処理
        this.objectCreateHandler(this.state.getBombToCreateQueue(), (bomb) =>
          this.createBombEvent(bomb)
        );
        this.objectRemoveHandler(this.state.getBombToExplodeQueue(), (bomb) =>
          this.removeBombEvent(bomb)
        );

        // ブロックの処理
        this.objectRemoveHandler(this.state.getBlockToDestroyQueue(), (block) =>
          this.removeBlockEvent(block)
        );

        // アイテムの処理
        this.objectRemoveHandler(this.state.getItemToDestroyQueue(), (item) =>
          this.removeItemEvent(item)
        );

        // ゲーム終了判定 TODO: ロビーができて、ちゃんとゲーム開始判定ができたら有効化する
        // if (
        //   this.state.gameState.isPlaying() &&
        //   this.state.gameState.isRemainPlayerZeroOrOne(this.state.players)
        // )
        //   this.state.gameState.setFinished();

        Matter.Engine.update(this.engine.engine, deltaTime);
      }
    });
  }

  // ゲーム開始イベント
  private gameStartEvent() {
    try {
      this.state.gameState.setPlaying();
      this.state.setTimer();
    } catch (e) {
      console.error(e);
    }
  }

  // キューに詰められた入力を処理し、キャラの移動を行う
  // TODO: 当たり判定
  // private fixedUpdate(deltaTime: number) {
  //   this.state.players.forEach((player) => {
  //     this.engine?.updatePlayer(player, deltaTime);
  //   });
  // }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');
    // create Player instance and add to matter
    this.engine.playerService.addPlayer(client.sessionId);
  }

  onLeave(client: Client, consented: boolean) {
    this.engine.playerService.deletePlayer(client.sessionId);
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }

  /*
  イベント関連
  */

  // 爆弾追加のイべント
  private createBombEvent(b: PlacementObjectInterface) {
    const bomb = b as Bomb;
    const isPlaced = this.engine.playerService.placeBomb(bomb); // ボムを設置する
    if (isPlaced) {
      this.state.getBombToExplodeQueue().enqueue(bomb);
    } else {
      this.engine.bombService.deleteBomb(bomb);
    }
  }

  // 爆弾削除のイべント
  private removeBombEvent(b: PlacementObjectInterface) {
    const bomb = b as Bomb;
    this.engine.bombService.explode(bomb);
  }

  // ブロック削除のイべント
  private removeBlockEvent(b: PlacementObjectInterface) {
    const block = b as Block;
    this.engine.mapService.destroyBlock(block);
  }

  // アイテム削除のイべント
  private removeItemEvent(b: PlacementObjectInterface) {
    const item = b as Item;
    this.engine.itemService.removeItem(item);
  }

  /*
  フレームごとの処理関連
  */

  // オブジェクトを設置するための処理
  private objectCreateHandler(
    queue: GameQueue<PlacementObjectInterface>,
    callback: (data: PlacementObjectInterface) => void
  ) {
    // キューに詰められたオブジェクトを処理する
    while (!queue.isEmpty()) {
      const data = queue.read();

      // 設置タイミングになってない場合は処理を終了する
      if (data === undefined || !data.isCreatedTime()) break;

      // 設置処理を行う
      callback(data);
      queue.dequeue();
    }
  }

  // オブジェクトを削除するための処理
  private objectRemoveHandler(
    queue: GameQueue<PlacementObjectInterface>,
    callback: (data: PlacementObjectInterface) => void
  ) {
    // キューに詰められたオブジェクトを処理する
    while (!queue.isEmpty()) {
      const data = queue.read();

      // 破壊タイミングになってない場合は処理を終了する
      if (data === undefined || !data.isRemovedTime()) break;

      // 設置処理を行う
      callback(data);
      queue.dequeue();
    }
  }

  private timeEventHandler() {
    if (!this.state.gameState.isPlaying()) return;

    // 壁落下イベント
    if (this.state.timer.getRemainTime() <= Constants.INGAME_EVENT_DROP_WALLS_TIME) {
      if (!this.IsFinishedDropWallsEvent) {
        dropWalls(this.engine);
      }
      this.IsFinishedDropWallsEvent = true;
    }
  }

  // 爆弾を設置する
  enemySetBomb(directMoveMap: number[][], highPriorityForBlastRadiusMap: number[][], enemy: Enemy) {
    // もし爆弾を置いたらどうなるか？のマップを作成する
    const mapIfSetBomb = getDirectMovableMapIfBombSet(
      directMoveMap,
      highPriorityForBlastRadiusMap,
      enemy.x,
      enemy.y,
      enemy.bombStrength
    );

    // console.log('mapIfSetBomb', mapIfSetBomb);
    if (!enemy.canSetBomb()) return;
    if (isSelfDie(directMoveMap, mapIfSetBomb, enemy, true)) return;
    // enemy.setGoal(getClosestAvailablePoint(mapIfSetBomb, {x, y: enemy.getTilePosition()});
    this.engine.bombService.enqueueBomb(enemy as Player);
  }

  enemyHandler() {
    if (!this.dummyFlag) return;
    if (!this.state.gameState.isPlaying()) return;

    // const DimensionalMap = this.engine.getDimensionalMap((bodies) => bodies);

    // 爆弾の影響度マップを作成する
    const futureBlastMap = treatLevelMapByBomb(
      this.engine.getDimensionalMap(this.engine.getHighestPriorityFromBodies),
      this.engine.getDimensionalMap((bodies) => this.engine.HasBomb(bodies))
    );

    // 爆風の位置から死亡マップを作成する
    const deathMap = reverseNormalizeDimension(
      normalizeDimension(influenceToOtherTile(futureBlastMap))
    );

    // 移動できるマス(ボムでブロックを破壊できる場所も含む)のマップを作成する
    // この時将来発生する爆風のマスは0にする
    const checkMovableDimensionalMap = this.engine.getDimensionalMap(this.engine.checkMovable);
    // .map((row, r) => row.map((col, c) => (futureBlastMap[r][c] === 1 ? 0 : col)));

    const movableMap = normalizeDimension(checkMovableDimensionalMap);
    // 爆風の範囲を測定するために使うマップを作成する
    const highPriorityForBlastRadiusMap = this.engine.getDimensionalMap(
      this.engine.getHighestPriorityFromBodies
    );
    // アイテムのマップ
    const itemMap = normalizeDimension(
      influenceToOtherTile(this.engine.getDimensionalMap(this.engine.HasItem))
    );
    // ブロックのマップ
    const blockMap = normalizeDimension(this.engine.getDimensionalMap(this.engine.HasBlock));

    // if (deathMap.flat().filter((v: number) => v < 1).length > 0) console.log('deathMap', deathMap);

    // 特定のマスの周囲のマスにどの程度空きマスがないか
    // const notFreeSpaceMap = reverseNormalizeDimension(
    //   normalizeDimension(treatLevelByFreeSpace(checkMovableDimensionalMap, 3))
    // );

    for (let i = 0; i < Constants.DEBUG_DEFAULT_ENEMY_COUNT; i++) {
      const player = this.state.getPlayer(`enemy-${i}`);
      if (player === undefined) continue;

      const enemy = player as Enemy;
      if (enemy.isDead()) continue;

      const { x: enemyX, y: enemyY } = enemy.getTilePosition();

      // 直接移動できるマスのマップを作成する
      const MoveCountMap = directMovableMap(checkMovableDimensionalMap, enemyX, enemyY);
      const directMoveMap = MoveCountMap.map((row, r) =>
        row.map((v, c) => (row[c] = v === Infinity ? 0 : 1))
      );

      // 一度に破壊できるブロックが多い場所のマップを作成する
      const goodBombPlaceMap = influenceToOtherTile(
        normalizeDimension(
          numberOfDestroyableBlock(directMoveMap, blockMap, highPriorityForBlastRadiusMap, enemy)
        )
      );

      // 影響度マップを作成する
      const impactMap = sumOfProductsSynthesis(movableMap, [
        // 爆弾、爆風の影響度マップ
        {
          dimensionalMap: deathMap,
          ratio: Constants.ENEMY_EVALUATION_RATIO_BOMB,
        },
        // 現在地点からの距離の影響度マップ
        {
          dimensionalMap: MoveCountMap,
          ratio: Constants.ENEMY_EVALUATION_RATIO_NEAREST,
        },
        // {
        //   // dimensionalMap: movableMap,
        //   dimensionalMap: notFreeSpaceMap,
        //   ratio: Constants.ENEMY_EVALUATION_RATIO_FREE_SPACE,
        // },
        // アイテムの影響度マップ
        {
          dimensionalMap: itemMap,
          ratio: Constants.ENEMY_EVALUATION_RATIO_ITEM,
        },
        // 破壊できるブロックの数の影響度マップ
        {
          dimensionalMap: goodBombPlaceMap,
          ratio: Constants.ENEMY_EVALUATION_RATIO_GOOD_BOMB_PLACE,
        },
      ]);

      // 影響度マップに対して、今移動できるマスのみを残す
      const impactMapIsMovable = impactMap.map((row, i) =>
        row.map((v, j) => v * directMoveMap[i][j])
      );
      // if (deathMap.flat().filter((v: number) => v < 1).length > 0) {
      // console.log('directMoveMap', directMoveMap);
      //   console.log('impactMap', impactMap);
      // console.log('impactMapIsMovable', impactMapIsMovable);
      // }

      // console.log('directMoveMap', directMoveMap);
      // console.log('impactMap', impactMap);
      if (deathMap.flat().filter((v: number) => v < 1).length > 0) {
        console.log('impactMap', impactMap);
        console.log('impactMapIsMovable', impactMapIsMovable);
        // console.log('directMoveMap', directMoveMap);
      }

      // impactMapIsMovable から、現在地点の周囲のマスの中で、最も影響度が高いマスを取得する
      const { x, y } = getHighestPriorityTile(impactMapIsMovable, enemyX, enemyY);
      // const { x, y } = getHighestPriorityTileSurround(impactMapIsMovable, enemyX, enemyY);

      // 最終的に移動するマスを決定する
      enemy.setGoal(x, y);

      // ゴールに着くまで移動

      if (!enemy.isMovedToGoal()) {
        // 最短の移動経路を取得する
        const moveList = searchPath(
          enemy.getTilePosition(),
          enemy.getGoalTilePosition(),
          directMoveMap
        );

        // console.log(
        //   'now:',
        //   enemy.getTilePosition(),
        //   'next:',
        //   enemy.getNextTilePosition(),
        //   'goal:',
        //   enemy.getGoalTilePosition()
        // );
        // console.log('impactMap', impactMap);
        // console.log('impactMapIsMovable', impactMapIsMovable);

        // 移動経路の結果が 0 の場合は、すでに目的にいるので何もしない
        if (moveList.length === 0) continue;
        // moveList.forEach((v) => console.log('moveList', v));

        // 次に移動するマスの安全度が1/2以下になるなら動かない
        console.log(enemy.inputQueue.length);
        console.log('now', enemy.x, enemy.y);
        console.log(
          'diff:',
          'now',
          impactMapIsMovable[enemyY][enemyX],
          'next',
          impactMapIsMovable[moveList[1][1]][moveList[1][0]]
        );
        if (
          impactMapIsMovable[moveList[1][1]][moveList[1][0]] <
          impactMapIsMovable[enemyY][enemyX] / 2
        ) {
          console.log('stop', enemy.x, enemy.y);
          //　
          this.engine.enemyService.stop(enemy);
          continue;
        }

        enemy.setNext(moveList[1][0], moveList[1][1]);

        // 次に移動するマスの脅威度が 0.3 以下の場合は、移動しない
        // if (impactMapIsMovable[moveList[1][1]][moveList[1][0]] < 0.1) continue;

        // if (deathMap.flat().filter((v: number) => v < 1).length > 0) console.log('x, y', x, y);
        const key = enemy.moveToDirection();
        const data = {
          player: enemy,
          inputPayload: {
            up: key.up,
            down: key.down,
            left: key.left,
            right: key.right,
          },
          isInput: true,
        };
        enemy.inputQueue.push(data);
        // console.log('set bomb');
      }
      this.enemySetBomb(directMoveMap, highPriorityForBlastRadiusMap, enemy);
      console.log(
        'now:',
        enemy.getTilePosition(),
        'next:',
        enemy.getNextTilePosition(),
        'goal:',
        enemy.getGoalTilePosition()
      );
      // }

      // const surroundTiles = enemy.getSurroundingTiles(movableMap);

      // for (const [key, value] of Object.entries(surroundTiles).sort(() => Math.random() - 0.5)) {
      //   if (this.engine.isMovable(movableMap[value.y][value.x])) {
      //     enemy.moveToNextTile(value.x, value.y);
      //   }
      // }

      // 爆弾設置
      // if (!player.canSetBomb()) return;
      // this.state.getBombToCreateQueue().enqueue(this.state.createBomb(player));
    }
  }
}
