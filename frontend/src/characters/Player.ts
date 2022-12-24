import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Matter.Sprite {
  public speed = 1;
  public readonly collisionScale = [0.8, 0.8];

  // set player speed
  setSpeed(speed: number) {
    this.speed = speed;
  }

  // set Player color
  setPlayerColor(color: number) {
    this.tint = color;
  }
}
