import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';
export default class GameResult extends Phaser.Scene {
  constructor() {
    super('gameResult');
  }

  create() {
    this.cameras.main.setSize(Constants.WIDTH, Constants.HEIGHT);
    this.cameras.main.setBackgroundColor('#000000');
    this.add
      .text(Constants.WIDTH / 2, Constants.HEIGHT / 2, 'Game Result', {
        fontSize: '100px',
        align: 'center',
      })
      .setOrigin(0.5);

    this.input.on('pointerup', () => this.scene.start('preloader'), this);
  }
}
