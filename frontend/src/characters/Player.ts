import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Matter.Sprite {
  public speed = 1;
  public bombStrength = 1;

  // set player speed
  setSpeed(speed: number) {
    this.speed = speed;
  }

  // set player bomb strength
  setBombStrength(bombStrength: number) {
    this.bombStrength = bombStrength;
  }

  // set Player color
  setPlayerColor(color: number) {
    this.tint = color;
  }
}
