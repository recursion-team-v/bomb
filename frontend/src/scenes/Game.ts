/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';
import '../characters/MyPlayer';
import '../characters/Enemy';
import { createPlayerAnims } from '../anims/PlayerAnims';
import { NavKeys, Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import Enemy from '../characters/Enemy';

export default class Game extends Phaser.Scene {
  private myPlayer!: MyPlayer;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private enemies: Enemy[] = [];
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
    createPlayerAnims(this.anims, 'player');

    // add myPlayer
    this.myPlayer = this.add.myPlayer(200, 200, 'player', undefined, {
      chamfer: {
        radius: 10,
      },
    });

    // TODO: 雑に敵を増やす
    createPlayerAnims(this.anims, 'enemy');
    for (let i = 0; i < 5; i++) {
      this.enemies.push(
        this.add.enemy(
          Phaser.Math.Between(0, 800),
          Phaser.Math.Between(0, 600),
          'enemy',
          undefined,
          {
            chamfer: {
              radius: 10,
            },
          }
        )
      );
    }
  }

  update() {
    if (this.cursors == null || this.myPlayer == null) return;
    this.myPlayer.update(this.cursors); // player controller handler
    this.enemies.reduce((acc, enemy) => {
      enemy?.update(this.myPlayer.x, this.myPlayer.y);
      return acc;
    }, 0);
  }
}
