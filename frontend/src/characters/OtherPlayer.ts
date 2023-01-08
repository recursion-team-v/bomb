import Player from './Player';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';

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
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(sessionId, world, x, y, texture, frame, options);
    this.serverX = x;
    this.serverY = y;
    this.frameKey = 14;
    this.setSensor(true); // プレイヤー同士はぶつからないようにする
    const randomColor = Math.floor(Math.random() * 16777215);
    this.setPlayerColor(randomColor);
  }

  handleServerChange(serverPlayer: ServerPlayer) {
    if (this.isDead()) return false;
    this.serverX = serverPlayer.x;
    this.serverY = serverPlayer.y;
    this.frameKey = serverPlayer.frameKey;
    this.setHP(serverPlayer.hp);

    if (this.isDead()) {
      this.died();
      setTimeout(() => {
        this.setVisible(false); // 見えなくする
      }, 2500);
    }
  }

  update() {
    if (this.isDead()) return false;
    // 線形補完(TODO: 調整)
    this.x = Math.ceil(Phaser.Math.Linear(this.x, this.serverX, 0.35)); // 動きがちょっと滑らか過ぎるから 0.2 -> 0.35
    this.y = Math.ceil(Phaser.Math.Linear(this.y, this.serverY, 0.35));
    this.setFrame(this.frameKey);
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
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    const sprite = new OtherPlayer(
      sessionId,
      this.scene.matter.world,
      x,
      y,
      texture,
      frame,
      options
    );

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
