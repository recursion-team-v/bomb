import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';
import collisionHandler from '../game_engine/collision_handler/collision_handler';
import Bomb from '../items/Bomb';
import { getDepth } from '../items/util';
import { getGameScene } from '../utils/globalGame';

export default class Player extends Phaser.Physics.Matter.Sprite {
  readonly name: string;
  private hp: number;
  private speed: number;
  private bombStrength: number;
  private maxBombCount: number; // 設置できるボムの最大個数
  private readonly sessionId: string; // サーバが一意にセットするセッションID
  private readonly hit_se;
  nameLabel!: Phaser.GameObjects.Container;

  constructor(
    sessionId: string,
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    name?: string,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, frame, options);
    this.name = name === undefined ? Constants.DEFAULT_PLAYER_NAME : name;
    this.hp = Constants.INITIAL_PLAYER_HP;
    this.sessionId = sessionId;
    this.speed = Constants.INITIAL_PLAYER_SPEED;
    this.bombStrength = Constants.INITIAL_BOMB_STRENGTH;
    this.maxBombCount = Constants.INITIAL_SETTABLE_BOMB_COUNT;

    this.setRectangle(Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT, {
      chamfer: 10, // 0だと壁に対して斜め移動すると突っかかるので増やす
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 0,
    });
    this.setFixedRotation();
    this.setFrame(14); // 最初は下向いてる
    this.setSensor(true); // サーバでのみ衝突判定を行う

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.PLAYER;

    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS));
    this.setOnCollide((data: Phaser.Types.Physics.Matter.MatterCollisionData) => {
      const currBody = this.body as MatterJS.BodyType;
      data.bodyA.id === currBody.id
        ? collisionHandler(data.bodyA, data.bodyB)
        : collisionHandler(data.bodyB, data.bodyA);
    });
    this.hit_se = this.scene.sound.add('hitPlayer', {
      volume: Config.SOUND_VOLUME,
    });
  }

  addNameLabel(triangleColor: number) {
    const game = getGameScene();
    const label = game.add.rectangle(0, -35, 15 * this.name.length, 30, Constants.BLACK, 0.3);
    const nameText = game.add.text(0, 0, this.name, {
      fontSize: '20px',
      color: '#ffffff',
    });
    const triangle = game.add.triangle(0, 0, -5, -5, 15, -5, 5, 5, triangleColor);

    Phaser.Display.Align.In.Center(nameText, label);
    Phaser.Display.Align.To.BottomCenter(triangle, label, 5, 8);

    this.nameLabel = game.add
      .container(this.x, this.y, [label, nameText, triangle])
      .setDepth(Infinity);
  }

  // HP をセットします
  setHP(hp: number) {
    // サーバで計算するので、ここではHPを上書きするだけ
    if (this.hp === hp) return;

    if (this.hp > hp) {
      this.damaged(this.hp - hp);
    } else {
      this.healed(hp - this.hp);
    }
  }

  // 生きているかを返します
  isDead(): boolean {
    return this.hp <= 0;
  }

  // interface を満たすだけのダミーメソッド
  damaged(damage: number) {
    this.hit_se.play();
    this.hp -= damage;
    this.animationShakeScreen();
    this.animationFlash(Constants.PLAYER_INVINCIBLE_TIME);
  }

  healed(healedHp: number) {
    this.hp += healedHp;
  }

  // ボムを設置できるかをチェックする
  canSetBomb(): boolean {
    if (this.isDead()) return false;

    // 同じ場所にボムを置けないようにする
    const { x, y } = Bomb.getSettablePosition(this.x, this.y);

    const game = getGameScene();
    const bodies = game.matter.intersectPoint(x, y);
    for (let i = 0; i < bodies.length; i++) {
      const bodyType = bodies[i] as MatterJS.BodyType;
      if (bodyType.label === Constants.OBJECT_LABEL.BOMB) {
        return false;
      }
    }

    return true;
  }

  getSessionId() {
    return this.sessionId;
  }

  // 爆弾の破壊力を取得する
  getBombStrength(): number {
    return this.bombStrength;
  }

  // 速さを取得する
  getSpeed(): number {
    return this.speed;
  }

  // set player speed
  setSpeed(speed: number): boolean {
    if (this.speed === speed) return false;
    this.speed = speed;
    return true;
  }

  // set player bomb strength
  setBombStrength(bombStrength: number): boolean {
    if (this.bombStrength === bombStrength) return false;
    this.bombStrength = bombStrength;
    return true;
  }

  // 最大設置可能なボムの数を設定する
  setMaxBombCount(maxBombCount: number): boolean {
    if (maxBombCount === this.maxBombCount) return false;
    this.maxBombCount = maxBombCount;
    return true;
  }

  // set Player color
  setPlayerColor(color: number) {
    this.tint = color;
  }

  // 死亡
  died() {
    this.stop();
    this.setToSleep(); // これをしないと移動中だとローテーション中に移動してしまう
    this.setVelocity(0, 0);
    this.setSensor(true);
    this.animationRotate();
  }

  isEqualSessionId(sessionId: string): boolean {
    return this.sessionId === sessionId;
  }

  // ボム増加アイテムを取得した数
  getItemCountOfBombCount(): number {
    return this.maxBombCount - Constants.INITIAL_SETTABLE_BOMB_COUNT;
  }

  // 爆弾の破壊力アイテムを取得した数
  getItemCountOfBombStrength(): number {
    return this.bombStrength - Constants.INITIAL_BOMB_STRENGTH;
  }

  // 速さアイテムを取得した数
  getItemCountOfSpeed(): number {
    return this.speed - Constants.INITIAL_PLAYER_SPEED;
  }

  private animationFlash(duration: number) {
    const juice = getGameScene().getJuice();

    // 一定時間無敵の演出
    const timer = setInterval(() => {
      juice.flash(this);
      if (this.isDead()) {
        clearInterval(timer);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(timer);
    }, duration);
  }

  private animationRotate() {
    const juice = getGameScene().getJuice();
    const rotateConfig = {
      angle: 450,
      duration: 500,
      ease: 'Circular.easeInOut',
      delay: 1000,
      paused: false,
    };

    juice.rotate(this, rotateConfig);
  }

  private animationShakeScreen(duration: number = 300) {
    this.scene.cameras.main.shake(duration, 0.01);
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'player',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    sessionId: string,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    name?: string,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const sprite = new Player(
      sessionId,
      this.scene.matter.world,
      x,
      y,
      texture,
      frame,
      name,
      options
    );

    // 使う用途がダミーなので、ここではコメントアウト
    // this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
