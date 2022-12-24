/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';
import '../characters/MyPlayer';
import { createPlayerAnims } from '../anims/PlayerAnims';
import { generateGroundArray, generateWallArray } from '../utils/generateMap';
import { NavKeys, Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';

export default class Game extends Phaser.Scene {
  private myPlayer?: MyPlayer;
  private cursors?: NavKeys;
  private readonly rows: number;
  private readonly cols: number;

  constructor() {
    super('game');
    this.rows = 11;
    this.cols = 15;
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

    const groundArray = generateGroundArray(this.rows, this.cols);
    const wallArray = generateWallArray(this.rows, this.cols);

    const groundMap = this.make.tilemap({ data: groundArray, tileWidth: 16, tileHeight: 16 });
    groundMap.addTilesetImage('tile_grounds', undefined, 16, 16, 0, 1);
    groundMap.createLayer(0, 'tile_grounds', 0, 0).setScale(4, 4);

    const wallMap = this.make.tilemap({ data: wallArray, tileWidth: 16, tileHeight: 16 });
    wallMap.addTilesetImage('tile_walls', undefined, 16, 16, 0, 1);
    const wallLayer = wallMap
      .createLayer(0, 'tile_walls', 0, 0)
      .setScale(4, 4)
      .setCollision([4, 6]);
    this.matter.world.convertTilemapLayer(wallLayer);

    // add myPlayer
    this.myPlayer = this.add.myPlayer(64 + 64 / 2, 64 + 64 / 2, 'player', undefined, {
      chamfer: {
        radius: 12,
      },
    });
  }

  update() {
    if (this.cursors == null || this.myPlayer == null) return;
    this.myPlayer.update(this.cursors); // player controller handler
  }
}
