/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';
import '../characters/MyPlayer';
import '../items/Bomb';
import '../items/BombExplosion';
import { createPlayerAnims } from '../anims/PlayerAnims';
import { generateGroundArray, generateWallArray } from '../utils/generateMap';
import { NavKeys, Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import { createBombAnims } from '../anims/BombAnims';
import { createExplodeAnims } from '../anims/explodeAnims';
import IngameConfig from '../config/ingameConfig';
import ScreenConfig from '../config/screenConfig';

export default class Game extends Phaser.Scene {
  private myPlayer?: MyPlayer;
  private cursors?: NavKeys;
  private readonly rows: number;
  private readonly cols: number;
  private readonly tileWidth = IngameConfig.tileWidth;
  private readonly tileHeight = IngameConfig.tileHeight;

  constructor() {
    super('game');
    this.rows = IngameConfig.tileRows;
    this.cols = IngameConfig.tileCols;
  }

  init() {
    // preload の前に呼ばれる
    // initialize key inputs
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D,SPACE') as Keyboard),
    };
  }

  create() {
    console.log('game: create game');

    // add player animations
    createPlayerAnims(this.anims);
    createBombAnims(this.anims);
    createExplodeAnims(this.anims);

    // add map
    this.generateMap();

    // add myPlayer
    this.myPlayer = this.add.myPlayer(
      IngameConfig.playerWith + IngameConfig.playerWith / 2,
      IngameConfig.playerHeight + IngameConfig.playerHeight / 2 + ScreenConfig.headerHeight,
      'player'
    );
  }

  update() {
    if (this.cursors == null || this.myPlayer == null) return;
    this.myPlayer.update(this.cursors); // player controller handler
  }

  private generateMap() {
    const groundArray = generateGroundArray(this.rows, this.cols);
    const wallArray = generateWallArray(this.rows, this.cols);

    const groundMap = this.make.tilemap({
      data: groundArray,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
    });
    groundMap.addTilesetImage('tile_grounds', undefined, this.tileWidth, this.tileHeight, 0, 0);
    groundMap.createLayer(0, 'tile_grounds', 0, ScreenConfig.headerHeight);

    const wallMap = this.make.tilemap({
      data: wallArray,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
    });
    wallMap.addTilesetImage('tile_walls', undefined, this.tileWidth, this.tileHeight, 0, 0);
    const wallLayer = wallMap
      .createLayer(0, 'tile_walls', 0, ScreenConfig.headerHeight)
      .setCollisionBetween(0, 50);
    this.matter.world.convertTilemapLayer(wallLayer);
  }
}
