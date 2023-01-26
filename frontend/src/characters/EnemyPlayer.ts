import * as Constants from '../../../backend/src/constants/constants';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import Player from './Player';

export default class EnemyPlayer extends Player {
  private serverX: number;
  private serverY: number;
  private oldX: number; // 一回前の位置(アニメーション用)
  private oldY: number; // 一回前の位置(アニメーション用)

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
    super(sessionId, world, x, y, texture, frame, name, options);
    this.serverX = x;
    this.serverY = y;
    this.oldX = x;
    this.oldY = y;
    this.setSensor(true); // プレイヤー同士はぶつからないようにする
    this.addNameLabel(Constants.RED);
  }

  handleServerChange(serverPlayer: ServerPlayer) {
    if (this.isDead()) return false;
    this.serverX = serverPlayer.x;
    this.serverY = serverPlayer.y;
    this.setHP(serverPlayer.hp);
    this.setSpeed(serverPlayer.speed);
    this.setBombType(serverPlayer.bombType);
    this.setBombStrength(serverPlayer.bombStrength);
    this.setPlayerName(serverPlayer.name);

    if (this.isDead()) {
      this.died();
      setTimeout(() => {
        this.setVisible(false); // 見えなくする
        this.nameLabel.setVisible(false);
      }, 2500);
    }
  }

  update() {
    if (this.isDead()) return false;
    // 線形補完(TODO: 調整)
    this.x = Math.ceil(Phaser.Math.Linear(this.x, this.serverX, 0.35)); // 動きがちょっと滑らか過ぎるから 0.2 -> 0.35
    this.y = Math.ceil(Phaser.Math.Linear(this.y, this.serverY, 0.35));

    const vx = Math.round(this.x - this.oldX);
    const vy = Math.round(this.y - this.oldY);

    let anim: string;
    if (vx > 0.75) {
      anim = `${this.character}_right`;
      this.lastDirection = 'right';
    } else if (vx < -0.75) {
      anim = `${this.character}_left`;
      this.lastDirection = 'left';
    } else if (vy > 0.75) {
      anim = `${this.character}_down`;
      this.lastDirection = 'down';
    } else if (vy < -0.75) {
      anim = `${this.character}_up`;
      this.lastDirection = 'up';
    } else {
      anim = `${this.character}_idle_${this.lastDirection}`;
    }
    this.play(anim, true);

    this.nameLabel.setPosition(this.x, this.y - 30);
    this.oldX = this.x;
    this.oldY = this.y;
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'enemyPlayer',
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
    const sprite = new EnemyPlayer(
      sessionId,
      this.scene.matter.world,
      x,
      y,
      texture,
      frame,
      name,
      options
    );

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
