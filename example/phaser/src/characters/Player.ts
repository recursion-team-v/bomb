import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly playerName?: Phaser.GameObjects.Text;
  public readonly playerContainer?: Phaser.GameObjects.Container;
  public speed = 160;
  public readonly collisionScale = [0.8, 0.8];

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    // create player container
    this.playerContainer = this.scene.add.container(this.x, this.y - 35).setDepth(5000);

    // add player name
    this.playerName = this.scene.add
      .text(0, 0, '')
      .setFontFamily('Arial')
      .setFontSize(12)
      .setColor('#000000')
      .setOrigin(0.5);
    this.playerContainer.add(this.playerName);

    // enable player container
    this.scene.physics.world.enable(this.playerContainer);
    const playerContainerBody = this.playerContainer.body as Phaser.Physics.Arcade.Body;
    playerContainerBody
      .setSize(this.width * this.collisionScale[0], this.height * this.collisionScale[1])
      .setOffset(-8, this.height * (1 - this.collisionScale[1]) + 6);
  }

  // set player speed
  setSpeed(speed: number) {
    this.speed = speed;
  }

  // set player name
  setPlayerName(name: string) {
    this.playerName?.setText(name);
  }
}
