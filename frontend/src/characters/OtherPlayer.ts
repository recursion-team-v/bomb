import * as Constants from '../../../backend/src/constants/constants';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import { getDepth } from '../items/util';
import Player from './Player';

export default class OtherPlayer extends Player {
  private serverX: number;
  private serverY: number;
  private frameKey: number;

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
    this.frameKey = 0;
    this.setSensor(true); // プレイヤー同士はぶつからないようにする
    this.addNameLabel(Constants.RED);

    // 自分のキャラクターと重なった時に、自分のキャラクターが上に来るようにする
    const body = this.body as MatterJS.BodyType;
    body.label = Constants.OBJECT_LABEL.PLAYER;
    this.setDepth(getDepth(body.label as Constants.OBJECT_LABELS) - 1);
  }

  handleServerChange(serverPlayer: ServerPlayer) {
    if (this.isDead()) return false;
    this.serverX = serverPlayer.x;
    this.serverY = serverPlayer.y;
    this.frameKey = serverPlayer.frameKey;
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
    this.setFrame(this.frameKey);
    this.nameLabel.setPosition(this.x, this.y - 30);
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'otherPlayer',
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
    const sprite = new OtherPlayer(
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
