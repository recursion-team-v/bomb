/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';
import '../characters/MyPlayer';
import '../items/Bomb';
import { createPlayerAnims } from '../anims/PlayerAnims';
import { NavKeys, Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import { createBombAnims } from '../anims/BombAnims';

export default class Game extends Phaser.Scene {
  private myPlayer?: MyPlayer;
  private cursors?: NavKeys;

  constructor() {
    super('game');
  }

  init() {
    // preload の前に呼ばれる
    // initialize key inputs
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D') as Keyboard),
    };
  }

  create() {
    console.log('game: create game');

    // add player animations
    createPlayerAnims(this.anims);
    createBombAnims(this.anims);

    // add myPlayer
    this.myPlayer = this.add.myPlayer(200, 200, 'player', undefined, {
      chamfer: {
        radius: 10,
      },
    });
    this.add.bomb(100, 100, 'bomb', undefined, {isStatic:true}).play("bomb_count")
    // this.add.bomb(10, 10, 'bomb', undefined, undefined).play("bomb_count2");
    // this.add.bomb(10, 10, 'bomb', undefined, undefined).play("bomb_count3");
  }

  update() {
    if (this.cursors == null || this.myPlayer == null) return;
    this.myPlayer.update(this.cursors); // player controller handler
  }
}
