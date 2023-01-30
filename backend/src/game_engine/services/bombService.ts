import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import { Bomb, getSettablePosition } from '../../rooms/schema/Bomb';
import Player from '../../rooms/schema/Player';
import { PixelToTile } from '../../utils/map';
import BlastService from './blastService';

export default class BombService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // ボムを matter に追加する
  addBomb(bomb: Bomb): boolean {
    const bombBody = Matter.Bodies.rectangle(
      bomb.x,
      bomb.y,
      Constants.DEFAULT_TIP_SIZE,
      Constants.DEFAULT_TIP_SIZE,
      {
        label: Constants.OBJECT_LABEL.WALL,
        // isSensor: false,
        isStatic: true,
      }
    );

    Matter.Composite.add(this.gameEngine.world, [bombBody]);
    this.gameEngine.bombBodies.set(bomb.id, bombBody);
    this.gameEngine.bombIdByBodyId.set(bombBody.id, bomb.id);
    return true;
  }

  // ボムを matter から削除する
  deleteBomb(bomb: Bomb) {
    // 設置者のボム数を増やす
    const player = this.gameEngine.getPlayer(bomb.sessionId);
    if (player !== undefined) {
      // ボムを設置したプレイヤーの設置中のボム数を減らす
      player.decreaseSetBombCount();
    }
    this.gameEngine.state.deleteBomb(bomb);
    const bombBody = this.gameEngine.bombBodies.get(bomb.id);
    if (bombBody === undefined) return;
    this.gameEngine.bombBodies.delete(bomb.id);
    Matter.Composite.remove(this.gameEngine.world, bombBody);
  }

  // ボムをキューに詰めます
  enqueueBomb(player: Player) {
    if (player.isDead()) return;
    if (!player.canSetBomb()) return;

    const { bx, by } = getSettablePosition(player.x, player.y);
    if (this.isExistsBombOnPosition(bx, by)) return;
    player.increaseSetBombCount();
    const bomb = new Bomb(bx, by, player.getBombType(), player.getBombStrength(), player.sessionId);
    this.gameEngine.state.bombs.set(bomb.id, bomb);
    this.gameEngine.state.getBombToCreateQueue().enqueue(bomb);
  }

  explode(bomb: Bomb) {
    // 既に爆発している場合は処理を終了する
    if (bomb.isExploded()) return;

    bomb.explode();

    // 爆風を作成する
    const blastService = new BlastService(this.gameEngine, bomb);
    blastService.add();

    // ボムを削除する
    this.deleteBomb(bomb);
  }

  // 誘爆の処理
  detonated(bombId: string) {
    const bomb = this.gameEngine.state.bombs.get(bombId);
    if (bomb === undefined) return;

    // 誘爆の場合は爆発までの delay を入れる
    this.gameEngine.room.clock.setTimeout(
      () => this.explode(bomb),
      Constants.BOMB_DETONATION_DELAY
    );
  }

  // 指定した位置にボムが存在するかどうかを返す
  private isExistsBombOnPosition(x: number, y: number): boolean {
    let isExists = false;
    const { x: tx, y: ty } = PixelToTile(x, y);

    // すでに matter に追加されているボムのリストをチェックする
    this.gameEngine.bombBodies.forEach((bombBody) => {
      if (bombBody.position.x === x && bombBody.position.y === y) {
        isExists = true;
      }
    });

    if (isExists) return true;

    // まだ matter に追加されていないボムのリストをチェックする
    this.gameEngine.state.bombs.forEach((bomb) => {
      const { x: bx, y: by } = PixelToTile(bomb.x, bomb.y);
      if (tx === bx && ty === by) isExists = true;
    });
    return isExists;
  }

  // 現在のボムのリストを返す
  private listBombs(): Matter.Body[] {
    return Array.from(this.gameEngine.bombBodies.values());
  }

  // 爆弾の衝突判定を更新する
  updateBombCollision() {
    this.setSensorFalseIfNoBodyOverlapped();
  }

  // 全ての爆弾に対して、爆弾に他のオブジェクトが重なっていない場合は衝突判定を有効にする
  private setSensorFalseIfNoBodyOverlapped() {
    this.listBombs().forEach((bombBody) => {
      // すでに当たり判定があるなら何もしない
      if (!bombBody.isSensor) return;

      const bombId = this.gameEngine.bombIdByBodyId.get(bombBody.id);
      if (bombId === undefined) return;
      const bomb = this.gameEngine.state.bombs.get(bombId);
      if (bomb === undefined) return;

      // ボムが爆発している場合は処理を終了する
      if (bomb.isExploded()) return;

      // ボムに重なっているオブジェクトの取得
      const bodies = Matter.Query.point(this.gameEngine.world.bodies, {
        x: bombBody.position.x,
        y: bombBody.position.y,
      });

      if (bodies.length <= 1) Matter.Body.set(bombBody, 'isSensor', false);
    });
  }
}
