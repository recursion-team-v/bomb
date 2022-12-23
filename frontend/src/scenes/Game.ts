/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';
import '../characters/MyPlayer';
import { createPlayerAnims } from '../anims/PlayerAnims';
import { NavKeys, Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';

export default class Game extends Phaser.Scene {
  private myPlayer?: MyPlayer;
  private cursors?: NavKeys;

  constructor() {
    super('game');
  }

  create() {
    console.log('game: create game');

    // initialize key inputs
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D') as Keyboard),
    };

    // add myPlayer
    this.myPlayer = this.add.myPlayer(200, 200, 'player', undefined, {
      chamfer: {
        radius: 10,
      },
    });

    // add player animations
    createPlayerAnims(this.anims);
  }

  update() {
    if (this.cursors == null || this.myPlayer == null) return;
    this.myPlayer.update(this.cursors); // player controller handler
  }
}
