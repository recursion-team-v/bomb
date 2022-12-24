/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';
import '../characters/MyPlayer';
import { createPlayerAnims } from '../anims/PlayerAnims';
import { NavKeys, Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import IngameConfig from '../config/ingame';

export default class Game extends Phaser.Scene {
  private myPlayer?: MyPlayer;
  private cursors?: NavKeys;
  private timer!: Phaser.Time.TimerEvent;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private timeLimitsSec: number; // ゲームの制限時間

  constructor(IngameConfig: IngameConfig) {
    super('game');

    // ゲームの制限時間
    this.timeLimitsSec = IngameConfig.getTimeLimitsSec();
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

    // add myPlayer
    this.myPlayer = this.add.myPlayer(200, 200, 'player', undefined, {
      chamfer: {
        radius: 10,
      },
    });

    // ゲームの制限時間
    this.timer = this.time.delayedCall(
      this.timeLimitsSec * 1000,
      () => {
        console.log('game: time up');
      },
      [],
      this
    );
  }

  update() {
    if (this.cursors == null || this.myPlayer == null) return;
    this.myPlayer.update(this.cursors); // player controller handler
  }
}
