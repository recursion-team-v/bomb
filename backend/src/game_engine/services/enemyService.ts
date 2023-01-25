import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import Enemy from '../../rooms/schema/Enemy';
import Player from '../../rooms/schema/Player';
import {
  directMovableMap,
  getDirectMovableMapIfBombSet,
  getHighestPriorityTile,
  getOtherPlayersMap,
  influenceToOtherTile,
  isSelfDie,
  normalizeDimension,
  numberOfDestroyableBlock,
  reverseNormalizeDimension,
  searchPath,
  sumOfProductsSynthesis,
  treatLevelMapByBomb,
} from '../../utils/calc';
import { TileToPixel } from '../../utils/map';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class EnemyService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // add のみメソッドが違うので別に定義する
  addEnemy(sessionId: string): Enemy {
    const enemy = this.gameEngine.state.createEnemy(sessionId);
    const enemyBody = Matter.Bodies.rectangle(
      enemy.x,
      enemy.y,
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

    this.gameEngine.playerBodies.set(sessionId, enemyBody);
    this.gameEngine.sessionIdByBodyId.set(enemyBody.id, sessionId);

    Matter.Composite.add(this.gameEngine.world, [enemyBody]);
    enemyBody.collisionFilter.category = Constants.COLLISION_CATEGORY.PLAYER;
    enemyBody.collisionFilter.mask = Constants.COLLISION_CATEGORY.DEFAULT;

    return enemy;
  }

  updateEnemy(enemy: Enemy, deltaTime?: number) {
    const player: Player = enemy as Player;
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
        if (enemy.isMovedToGoal()) {
          this.stop(enemy);
          break;
        }
        const velocity = player.speed;
        let vx = 0;
        let vy = 0;
        if (inputPayload.left === true) vx -= velocity;
        if (inputPayload.right === true) vx += velocity;
        if (inputPayload.up === true) vy -= velocity;
        if (inputPayload.down === true) vy += velocity;
        Matter.Body.setVelocity(playerBody, { x: vx, y: vy });
      }
    }
  }

  stop(enemy: Enemy) {
    enemy.stop();
    const playerBody = this.gameEngine.playerBodies.get(enemy.sessionId);
    if (playerBody === undefined) return;
    Matter.Body.setVelocity(playerBody, { x: 0, y: 0 });

    // 急に止めると、マス目にぴったり止まらず爆風に当たることがあるので、マス目に合わせる
    const { x: tx, y: ty } = enemy.getTilePosition();
    Matter.Body.setPosition(playerBody, TileToPixel(tx, ty));
  }

  // 現在の盤面から、敵の移動先を計算しキューに詰める
  calcAdjustablePosition() {
    const engine = this.gameEngine;
    const state = engine.state;

    // 爆弾の影響度マップを作成する
    const futureBlastMap = treatLevelMapByBomb(
      engine.getDimensionalMap(engine.getHighestPriorityFromBodies),
      state.hasBomb(engine.getDimensionalMap((bodies) => bodies))
    );

    // 爆風の位置から死亡マップを作成する
    const deathMap = reverseNormalizeDimension(
      normalizeDimension(influenceToOtherTile(futureBlastMap))
    );

    // 移動できるマス(ボムでブロックを破壊できる場所も含む)のマップを作成する
    // この時将来発生する爆風のマスは0にする
    const checkMovableDimensionalMap = engine.getDimensionalMap(engine.checkMovable);
    const movableMap = normalizeDimension(checkMovableDimensionalMap);

    // 爆風の範囲を測定するために使うマップを作成する
    const highPriorityForBlastRadiusMap = engine.getDimensionalMap(
      engine.getHighestPriorityFromBodies
    );

    // アイテムのマップ
    const itemMap = normalizeDimension(
      influenceToOtherTile(engine.getDimensionalMap(engine.HasItem))
    );

    // ブロックのマップ
    const blockMap = normalizeDimension(engine.getDimensionalMap(engine.HasBlock));

    // 爆風のマップ
    const blastMap = engine.getDimensionalMap(engine.HasBlast);

    // 敵の数だけループして移動処理を行う
    for (let i = 0; i < Constants.DEBUG_DEFAULT_ENEMY_COUNT; i++) {
      const player = state.getPlayer(`enemy-${i}`);
      if (player === undefined) continue;

      const enemy = player as Enemy;
      if (enemy.isDead()) continue;

      const { x: enemyX, y: enemyY } = enemy.getTilePosition();

      // 自分が今、直接移動できるマスのマップを作成する
      const MoveCountMap = directMovableMap(checkMovableDimensionalMap, enemyX, enemyY);
      const directMoveMap = MoveCountMap.map((row, r) =>
        // Infinityは移動できないマスなので 0 に変換する
        // 0: 移動できないマス
        // 1: 移動できるマス
        row.map((v, c) => (row[c] = v === Infinity ? 0 : 1))
      );

      // 他のユーザとの距離を評価するマップを作成する
      // 離れているほど評価が高くなる
      const farFromOtherPlayerMap = reverseNormalizeDimension(
        normalizeDimension(
          influenceToOtherTile(getOtherPlayersMap(enemy.sessionId, state.getAvailablePlayers()))
        )
      );

      const gameStep = enemy.getStep(state.timer);

      // 爆弾をおいたときに、一度に破壊できるブロックが多い場所を評価するマップを作成する
      let goodBombPlaceMap: number[][] = [];

      // 計算量が多いので、ブロックの数が一定数以下の場合は計算しない
      const currentBlocks = blockMap.flat().filter((row) => row === 1).length;
      const mapSizeWithoutWall =
        (Constants.TILE_COLS - 2) * (Constants.TILE_ROWS - 2) -
        (Constants.TILE_COLS / 2 - 1) -
        (Constants.TILE_ROWS / 2 - 1);

      if (currentBlocks / mapSizeWithoutWall >= 0.65) {
        goodBombPlaceMap = influenceToOtherTile(
          normalizeDimension(
            numberOfDestroyableBlock(directMoveMap, blockMap, highPriorityForBlastRadiusMap, enemy)
          )
        );
      }

      // AI の動きを決定するため、残り時間に応じたステップを取得
      const targets = [];

      for (const key in Constants.ENEMY_EVALUATION_RATIO_PER_STEP[gameStep]) {
        switch (key) {
          // 爆弾、爆風の影響度マップ
          case Constants.ENEMY_EVALUATION_RATIO_LABEL.ENEMY_EVALUATION_RATIO_BOMB:
            targets.push({
              dimensionalMap: deathMap,
              ratio: Constants.ENEMY_EVALUATION_RATIO_PER_STEP[gameStep][key] ?? 0,
            });
            break;

          // 現在地点からの距離の影響度マップ
          case Constants.ENEMY_EVALUATION_RATIO_LABEL.ENEMY_EVALUATION_RATIO_NEAREST:
            targets.push({
              dimensionalMap: MoveCountMap,
              ratio: Constants.ENEMY_EVALUATION_RATIO_PER_STEP[gameStep][key] ?? 0,
            });
            break;

          // アイテムの影響度マップ
          case Constants.ENEMY_EVALUATION_RATIO_LABEL.ENEMY_EVALUATION_RATIO_ITEM:
            targets.push({
              dimensionalMap: itemMap,
              ratio: Constants.ENEMY_EVALUATION_RATIO_PER_STEP[gameStep][key] ?? 0,
            });
            break;

          // 破壊できるブロック数の影響度マップ
          case Constants.ENEMY_EVALUATION_RATIO_LABEL.ENEMY_EVALUATION_RATIO_GOOD_BOMB_PLACE:
            if (goodBombPlaceMap.length === 0) break;
            targets.push({
              dimensionalMap: goodBombPlaceMap,
              ratio: Constants.ENEMY_EVALUATION_RATIO_PER_STEP[gameStep][key] ?? 0,
            });
            break;

          // 他のプレイヤーからの距離の影響度マップ
          case Constants.ENEMY_EVALUATION_RATIO_LABEL.ENEMY_EVALUATION_RATIO_FAR_FROM_OTHER_PLAYER:
            targets.push({
              dimensionalMap: farFromOtherPlayerMap,
              ratio: Constants.ENEMY_EVALUATION_RATIO_PER_STEP[gameStep][key] ?? 0,
            });
            break;
        }
      }

      // マップを組み合わせて、影響度マップを作成する
      const impactMap = sumOfProductsSynthesis(movableMap, targets);

      // 移動出来ないマスの影響度が高いと、移動できないマスに移動しようとしいつまでも次の行動に移らないので
      // 影響度マップに対して、今移動できるマスのみを残す
      const impactMapIsMovable = impactMap.map((row, i) =>
        row.map((v, j) => v * directMoveMap[i][j])
      );

      // impactMapIsMovable から、最も良いマス(異動すべきマス)を取得し、ゴールを設定する
      const { x, y } = getHighestPriorityTile(impactMapIsMovable, enemyX, enemyY);
      enemy.setGoal(x, y);

      // ゴールに着くまで移動を行う
      if (!enemy.isMovedToGoal()) {
        // 最短の移動経路を取得する
        const moveList = searchPath(
          enemy.getTilePosition(),
          enemy.getGoalTilePosition(),
          directMoveMap
        );

        // 移動経路の結果が 0 の場合は、すでに目的にいるので何もしない
        if (moveList.length === 0) continue;

        // 次に移動するマスの安全度が1/2以下 or 爆風があるマスなるなら動かない
        // これがないと、最短経路という理由で爆風があるマスに移動しようとしてしまう
        const downRate = 0.5;
        if (
          impactMapIsMovable[moveList[1][1]][moveList[1][0]] <=
            impactMapIsMovable[enemyY][enemyX] * downRate ||
          blastMap[moveList[1][1]][moveList[1][0]] === 1
        ) {
          engine.enemyService.stop(enemy);
          continue;
        }

        // 移動時に一定時間経過したら爆弾を設置する
        if (Date.now() - enemy.stoppedAt < Constants.ENEMY_PLACE_BOMB_INTERVAL_AFTER_MOVE) {
          this.enemySetBomb(impactMapIsMovable, highPriorityForBlastRadiusMap, enemy);
          enemy.setStoppedAt();
        }

        // 次に移動するマスを設定する
        // setGoal は最終的に移動するマス、setNext は次に移動するマス
        enemy.setNext(moveList[1][0], moveList[1][1]);

        // 次に移動するマスに合わせて、入力キーを設定しキューに追加する
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
      } else {
        enemy.setStoppedAt();
        // ゴールに着いたら、爆弾を設置する
        this.enemySetBomb(impactMapIsMovable, highPriorityForBlastRadiusMap, enemy);
      }
    }
  }

  // 爆弾を設置する
  enemySetBomb(
    impactMapIsMovable: number[][],
    highPriorityForBlastRadiusMap: number[][],
    enemy: Enemy
  ) {
    // ただし、爆弾を設置するときには、自殺にならないように設置する爆弾の影響を考慮する
    const safeTileRate = 0.5;

    // 爆風の位置を含めて、マス目の安全度が 0.5 以上のマスを移動可能とみなす
    const directMoveMapIncludeBlast = impactMapIsMovable.map((row, i) =>
      row.map((v, j) => (v >= safeTileRate ? 1 : 0))
    );

    // もし爆弾を置いたらどうなるか？のマップを作成する
    const mapIfSetBomb = getDirectMovableMapIfBombSet(
      directMoveMapIncludeBlast,
      highPriorityForBlastRadiusMap,
      enemy.x,
      enemy.y,
      enemy.bombStrength
    );

    if (!enemy.canSetBomb()) return;

    // もし爆弾を置いたら自分が死ぬなら爆弾を置かない
    if (isSelfDie(directMoveMapIncludeBlast, mapIfSetBomb, enemy)) return;

    this.gameEngine.bombService.enqueueBomb(enemy as Player);
  }
}
