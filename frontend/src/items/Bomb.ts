import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import BombInterface from '../../../backend/src/interfaces/bomb';
import collisionHandler from '../game_engine/collision_handler/collision_handler';

export default class Bomb extends Phaser.Physics.Matter.Sprite {
  private readonly bombStrength: number;
  private readonly player: PlayerInterface;

  // 誘爆時は状況によって爆弾が消えてしまい、座標やシーンが取得できなくなるため保存しておく
  private readonly stableX: number; // 爆弾が消えても座標を保持するための変数
  private readonly stableY: number; // 爆弾が消えても座標を保持するための変数
  private readonly stableScene: Phaser.Scene; // 爆弾が消えてもシーンを保持するための変数

  private readonly sessionId: string; // サーバが一意にセットするセッションID(誰の爆弾か)

  constructor(
    sessionId: string,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    bombStrength: number,
    player: PlayerInterface
  ) {
    super(world, x, y, texture);

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.BOMB;

    this.sessionId = sessionId;
    this.player = player;
    this.bombStrength = bombStrength;
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
      ? Constants.DEFAULT_TIP_SIZE * Constants.BOMB_COLLISION_RATIO
      : Constants.DEFAULT_TIP_SIZE;
    const ry = rectHorizontal
      ? Constants.DEFAULT_TIP_SIZE * Constants.BOMB_COLLISION_RATIO
      : Constants.DEFAULT_TIP_SIZE;

    this.stableScene.add
      .blast(bx, by, playKey, this.bombStrength, rx, ry)
      .setScale(scale, scale)
      .setAngle(angle)
      .play(playKey)
      .setSensor(true);
  }

  private addDirectionBlast(direction: 'left' | 'right' | 'up' | 'down') {
    const power = this.bombStrength;
    let angle = 0;
    let dynamicX = 0;
    let dynamicY = 0;

    if (direction === 'right') {
      angle = 0;
      dynamicX = Constants.TILE_WIDTH;
    } else if (direction === 'down') {
      angle = 90;
      dynamicY = Constants.TILE_HEIGHT;
    } else if (direction === 'left') {
      angle = 180;
      dynamicX = -Constants.TILE_WIDTH;
    } else if (direction === 'up') {
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
      this.stableX + dynamicX * this.bombStrength,
      this.stableY + dynamicY * this.bombStrength,
      'bomb_horizontal_end_blast',
      angle,
      false,
      true
    );
  }

  explode() {
    // center
    this.addBlastSprite(this.stableX, this.stableY, 'bomb_center_blast', 0, true, true, 1.2);

    // center 以外
    this.addDirectionBlast('up');
    this.addDirectionBlast('down');
    this.addDirectionBlast('right');
    this.addDirectionBlast('left');
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
    sprite.play('bomb_count', false);

    // bomb_count アニメーションが終わったら explode
    sprite.once('animationcomplete', () => {
      sprite.explode();
      sprite.afterExplosion();
    });

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
