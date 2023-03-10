import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';
import Bomb from '../items/Bomb';
import { getDepth } from '../items/util';
import { getGameScene } from '../utils/globalGame';

export default class Player extends Phaser.Physics.Matter.Sprite {
  name: string;
  character: string;
  private hp: number;
  private speed: number;
  private bombType: Constants.BOMB_TYPES; // ボムの種類
  private bombStrength: number;
  private maxBombCount: number; // 設置できるボムの最大個数
  private readonly sessionId: string; // サーバが一意にセットするセッションID
  private readonly hit_se;
  nameLabel!: Phaser.GameObjects.Container;
  nameText!: Phaser.GameObjects.Text;
  lastDirection: 'right' | 'left' | 'up' | 'down' = 'down';
  dmgAnimPlaying = false;

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
    this.character = texture;
    this.hp = Constants.INITIAL_PLAYER_HP;
    this.sessionId = sessionId;
    this.speed = Constants.INITIAL_PLAYER_SPEED;
    this.bombType = Constants.BOMB_TYPE.NORMAL;
    this.bombStrength = Constants.INITIAL_BOMB_STRENGTH;
    this.maxBombCount = Constants.INITIAL_SETTABLE_BOMB_COUNT;

    this.setScale(1.3, 1);
    this.setRectangle(Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT, {
      chamfer: 10, // 0だと壁に対して斜め移動すると突っかかるので増やす
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 0,
    });
    this.setFixedRotation();

    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.PLAYER;

    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS));
    this.hit_se = this.scene.sound.add('hitPlayer', {
      volume: Config.SOUND_VOLUME,
    });
  }

  addNameLabel(triangleColor: number) {
    const game = getGameScene();
    const nameText = game.add
      .text(0, 0, this.name, {
        fontSize: '20px',
        fontFamily: 'PressStart2P',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const label = game.add.rectangle(0, -35, nameText.width + 20, 30, Constants.BLACK, 0.3);
    const triangle = game.add.triangle(0, 0, -5, -5, 15, -5, 5, 5, triangleColor);
    this.nameText = nameText;

    Phaser.Display.Align.In.Center(nameText, label);
    Phaser.Display.Align.To.BottomCenter(triangle, label, 5, 8);

    this.nameLabel = game.add.container(this.x, this.y, [label, nameText, triangle]).setDepth(1000);
  }

  getHP(): number {
    return this.hp;
  }

  // HP をセットします
  // HP が増えた場合は true を返します
  setHP(hp: number): boolean {
    // サーバで計算するので、ここではHPを上書きするだけ
    if (this.hp === hp) return true;

    if (this.hp > hp) {
      this.damaged(this.hp - hp);
      return false;
    } else {
      this.healed(hp - this.hp);
      return true;
    }
  }

  // 生きているかを返します
  isDead(): boolean {
    return this.hp <= 0;
  }

  // interface を満たすだけのダミーメソッド
  private damaged(damage: number) {
    this.hit_se.play();
    this.hp -= damage;
    this.animationShakeScreen();
    this.dmgAnimPlaying = true;
    this.play(`${this.character}_damage_${this.lastDirection}`).on('animationcomplete', () => {
      this.dmgAnimPlaying = false;
      this.animationFlash(Constants.PLAYER_INVINCIBLE_TIME);
    });
  }

  private healed(healedHp: number) {
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

  getBombType(): Constants.BOMB_TYPES {
    return this.bombType;
  }

  setBombType(bombType: Constants.BOMB_TYPES): boolean {
    if (this.bombType === bombType) return false;
    this.bombType = bombType;
    return true;
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
    this.play(`${this.character}_death_${this.lastDirection}`);
  }

  isEqualSessionId(sessionId: string): boolean {
    return this.sessionId === sessionId;
  }

  // ボム増加アイテムを取得した数
  getItemCountOfBombCount(): number {
    return (
      (this.maxBombCount - Constants.INITIAL_SETTABLE_BOMB_COUNT) /
      Constants.ITEM_INCREASE_RATE.BOMB_POSSESSION_UP
    );
  }

  // 爆弾の破壊力アイテムを取得した数
  getItemCountOfBombStrength(): number {
    return (
      (this.bombStrength - Constants.INITIAL_BOMB_STRENGTH) /
      Constants.ITEM_INCREASE_RATE.BOMB_STRENGTH
    );
  }

  // 速さアイテムを取得した数
  getItemCountOfSpeed(): number {
    return (
      (this.speed - Constants.INITIAL_PLAYER_SPEED) / Constants.ITEM_INCREASE_RATE.PLAYER_SPEED
    );
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

  private animationShakeScreen(duration: number = 300) {
    this.scene.cameras.main.shake(duration, 0.01);
  }

  setPlayerName(userName: string) {
    if (this.name === userName) return;
    this.name = userName;
    this.nameText.setText(userName);
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
