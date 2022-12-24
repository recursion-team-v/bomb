import Phaser from 'phaser';
import ScreenConfig from '../config/screenConfig';

export default class GameResult extends Phaser.Scene {
  constructor() {
    super('gameResult');
  }

  create() {
    this.cameras.main.setSize(ScreenConfig.width, ScreenConfig.height);
    this.cameras.main.setBackgroundColor('#000000');
    this.add
      .text(ScreenConfig.width / 2, ScreenConfig.height / 2, 'Game Result', {
        fontSize: '100px',
        align: 'center',
      })
      .setOrigin(0.5);

    this.input.on('pointerup', () => this.scene.start('preloader'), this);
  }
}
