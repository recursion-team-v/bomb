import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import { calcBlastRangeFromDirection } from '../../../backend/src/game_engine/services/blastService';
import BombInterface from '../../../backend/src/interfaces/bomb';
import * as Config from '../config/config';
import collisionHandler from '../game_engine/collision_handler/collision_handler';
import { phaserGlobalGameObject } from '../PhaserGame';
import Game from '../scenes/Game';
import { getDimensionalMap, getHighestPriorityFromBodies } from '../services/Map';
import { getDepth } from './util';

export default class Bomb extends Phaser.Physics.Matter.Sprite {
  private readonly bombStrength: number;
  private readonly player: PlayerInterface;

  // 誘爆時は状況によって爆弾が消えてしまい、座標やシーンが取得できなくなるため保存しておく
  private readonly stableX: number; // 爆弾が消えても座標を保持するための変数
  private readonly stableY: number; // 爆弾が消えても座標を保持するための変数
  private readonly stableScene: Phaser.Scene; // 爆弾が消えてもシーンを保持するための変数

  private readonly sessionId: string; // サーバが一意にセットするセッションID(誰の爆弾か)
  private readonly explodedAt: number; // サーバで管理している爆発する時間

  constructor(
    sessionId: string,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    bombStrength: number,
    explodedAt: number,
    player: PlayerInterface
  ) {
    super(world, x, y, texture);

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.BOMB;

    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS));
    this.sessionId = sessionId;
    this.player = player;
    this.bombStrength = bombStrength;
    this.explodedAt = explodedAt;
    this.stableX = x;
    this.stableY = y;
    this.stableScene = this.scene;
  }

  // 指定の座標から設置可能な座標を返します
  static getSettablePosition(x: number, y: number): { x: number; y: number } {
    const bx =
      Math.floor(x / Constants.TILE_WIDTH) * Constants.TILE_WIDTH + Constants.TILE_WIDTH / 2;
    const by =
      Math.floor(y / Constants.TILE_HEIGHT) * Constants.TILE_HEIGHT + Constants.TILE_HEIGHT / 2;

    return { x: bx, y: by };
  }

  private addBlastSprite(
    bx: number,
    by: number,
    playKey: string,
    angle: number = 0,
    rectVertical: boolean = false,
    rectHorizontal: boolean = false,
    scale: number = 1
  ) {
    const rx = rectVertical
      ? Constants.DEFAULT_TIP_SIZE * Constants.BLAST_COLLISION_RATIO_X
      : Constants.DEFAULT_TIP_SIZE * Constants.BLAST_COLLISION_RATIO_Y;
    const ry = rectHorizontal
      ? Constants.DEFAULT_TIP_SIZE * Constants.BLAST_COLLISION_RATIO_X
      : Constants.DEFAULT_TIP_SIZE * Constants.BLAST_COLLISION_RATIO_Y;

    this.stableScene.add
      .blast(bx, by, playKey, this.bombStrength, rx, ry)
      .setScale(scale, scale)
      .setAngle(angle)
      .play(playKey)
      .setSensor(true);
  }

  private addDirectionBlast(direction: Constants.DIRECTION_TYPE, power: number) {
    if (power === 0) return;
    let angle = 0;
    let dynamicX = 0;
    let dynamicY = 0;

    if (direction === Constants.DIRECTION.RIGHT) {
      angle = 0;
      dynamicX = Constants.TILE_WIDTH;
    } else if (direction === Constants.DIRECTION.DOWN) {
      angle = 90;
      dynamicY = Constants.TILE_HEIGHT;
    } else if (direction === Constants.DIRECTION.LEFT) {
      angle = 180;
      dynamicX = -Constants.TILE_WIDTH;
    } else if (direction === Constants.DIRECTION.UP) {
      angle = 270;
      dynamicY = -Constants.TILE_HEIGHT;
    }

    if (power > 1) {
      for (let i = 1; i < power; i++) {
        this.addBlastSprite(
          this.stableX + dynamicX * i,
          this.stableY + dynamicY * i,
          'bomb_horizontal_blast',
          angle,
          false,
          true
        );
      }
    }

    this.addBlastSprite(
      this.stableX + dynamicX * power,
      this.stableY + dynamicY * power,
      'bomb_horizontal_end_blast',
      angle,
      false,
      true
    );
  }

  explode() {
    // center
    this.addBlastSprite(this.stableX, this.stableY, 'bomb_center_blast', 0, true, true, 1.2);

    const br = this.calcBlastRange();
    // center 以外
    this.addDirectionBlast(Constants.DIRECTION.UP, br.get(Constants.DIRECTION.UP) ?? 1);
    this.addDirectionBlast(Constants.DIRECTION.DOWN, br.get(Constants.DIRECTION.DOWN) ?? 1);
    this.addDirectionBlast(Constants.DIRECTION.RIGHT, br.get(Constants.DIRECTION.RIGHT) ?? 1);
    this.addDirectionBlast(Constants.DIRECTION.LEFT, br.get(Constants.DIRECTION.LEFT) ?? 1);
  }

  // 爆風の範囲を計算する
  private calcBlastRange(): Map<Constants.DIRECTION_TYPE, number> {
    // 自分自身から scene を取得すると、爆弾が爆発した後に scene が取得できなくなりエラーになるので window オブジェクトから取得する
    const scene = phaserGlobalGameObject().scene.getScene(Config.SCENE_NAME_GAME);
    const map = getDimensionalMap(
      // TODO: サーバから受け取ったマップの X/ Y のタイル数を使う
      (scene as Game).getRows(),
      (scene as Game).getCols(),
      scene,
      getHighestPriorityFromBodies
    );

    // 現在のユーザの爆弾の強さを取得
    const power = this.bombStrength;

    // 現在のユーザの爆弾の位置を取得
    const x = (this.stableX - Constants.TILE_WIDTH / 2) / Constants.TILE_WIDTH;
    const y =
      (this.stableY - Constants.TILE_HEIGHT / 2 - Constants.HEADER_HEIGHT) / Constants.TILE_HEIGHT;

    // 現在のユーザの爆弾の位置から上下左右の範囲を計算
    const m = new Map<Constants.DIRECTION_TYPE, number>();

    m.set(
      Constants.DIRECTION.UP,
      calcBlastRangeFromDirection(map, x, y, power, Constants.DIRECTION.UP)
    );
    m.set(
      Constants.DIRECTION.DOWN,
      calcBlastRangeFromDirection(map, x, y, power, Constants.DIRECTION.DOWN)
    );
    m.set(
      Constants.DIRECTION.LEFT,
      calcBlastRangeFromDirection(map, x, y, power, Constants.DIRECTION.LEFT)
    );
    m.set(
      Constants.DIRECTION.RIGHT,
      calcBlastRangeFromDirection(map, x, y, power, Constants.DIRECTION.RIGHT)
    );
    return m;
  }

  updateCollision() {
    this.setSensor(false);

    const obj = this.setRectangle(
      Constants.TILE_WIDTH,
      Constants.TILE_HEIGHT
    ) as Phaser.Physics.Matter.Sprite;
    obj.setStatic(true);

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.BOMB;
    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS));
  }

  // 引数の MatterJS.BodyType が爆弾の当たり判定と重なっているかどうかを返す
  isOverlapping(mp: Phaser.Physics.Matter.MatterPhysics, target: MatterJS.BodyType) {
    return mp.overlap(this.body as MatterJS.BodyType, [target]);
  }

  // ボムが爆発した後の処理
  afterExplosion() {
    this.destroy();

    // 自分の爆弾の時のみ爆弾の数を回復する
    if (this.player.isEqualSessionId(this.sessionId)) this.player.recoverSettableBombCount();
  }

  // 誘爆時の処理
  detonated(bomb: BombInterface) {
    const b = bomb as Bomb;
    b.scene.time.addEvent({
      delay: Constants.BOMB_DETONATION_DELAY,
      callback: () => {
        if (b === null) return;
        b.explode();
        b.afterExplosion();
      },
    });
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'bomb',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    sessionId: string,
    x: number,
    y: number,
    bombStrength = Constants.INITIAL_BOMB_STRENGTH,
    player: PlayerInterface
  ) {
    const sprite = new Bomb(sessionId, this.scene.matter.world, x, y, 'bomb', bombStrength, player);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    sprite.setStatic(true);
    sprite.setSensor(true);
    sprite.play(
      {
        key: Config.BOMB_ANIMATION_KEY,
        // 秒間に表示する画像の枚数
        frameRate: Config.BOMB_SPRITE_FRAME_COUNT,
      },
      false
    );

    setTimeout(() => {
      sprite.explode();
      sprite.afterExplosion();
    }, Constants.BOMB_EXPLOSION_TIME);

    return sprite;
  }
);

export class Blast extends Phaser.Physics.Matter.Sprite {
  private readonly bombStrength: number;

  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    bombStrength: number,
    rectangleX: number,
    rectangleY: number
  ) {
    super(world, x, y, texture);
    this.bombStrength = bombStrength;
    this.setRectangle(rectangleX, rectangleY);
    this.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
      const currBody = this.body as MatterJS.BodyType;
      data.bodyA.id === currBody.id
        ? collisionHandler(data.bodyA, data.bodyB)
        : collisionHandler(data.bodyB, data.bodyA);
    });

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.BLAST;
  }

  playAnim() {
    this.scene.time.addEvent({
      delay: Constants.BLAST_AVAILABLE_TIME,
      callback: () => {
        this.destroy();
      },
    });
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'blast',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    bombStrength = 1,
    rectangleX: number,
    rectangleY: number
  ) {
    const sprite = new Blast(
      this.scene.matter.world,
      x,
      y,
      texture,
      bombStrength,
      rectangleX,
      rectangleY
    );

    this.displayList.add(sprite);
    this.updateList.add(sprite);
    sprite.playAnim();
    return sprite;
  }
);

export interface PlayerInterface {
  setBombStrength: (bombStrength: number) => void;
  increaseMaxBombCount: () => void;
  recoverSettableBombCount: () => void;
  consumeSettableBombCount: () => void;
  canSetBomb: (mp: Phaser.Physics.Matter.MatterPhysics) => boolean;
  placeBomb: (mp: Phaser.Physics.Matter.MatterPhysics) => void;
  isEqualSessionId: (sessionId: string) => boolean;
}
