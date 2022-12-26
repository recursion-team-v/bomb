/* eslint-disable import/no-duplicates */
import { Room } from 'colyseus.js';
import Phaser from 'phaser';
import Server from '../core/server';
import Player from '../../../backend/src/core/player';
import State from '../../../backend/src/core/state';
import '../characters/MyPlayer';
import '../items/Bomb';
import { createPlayerAnims } from '../anims/PlayerAnims';
import { generateGroundArray, generateWallArray } from '../utils/generateMap';
import { NavKeys, Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import { createBombAnims } from '../anims/BombAnims';
import { createExplodeAnims } from '../anims/explodeAnims';
import IngameConfig from '../config/ingameConfig';
import ScreenConfig from '../config/screenConfig';
import { NOTIFICATION_TYPE } from '../../../constants/constants';

export default class Game extends Phaser.Scene {
  private myPlayer?: MyPlayer;
  private cursors?: NavKeys;
  private readonly rows: number;
  private readonly cols: number;
  private readonly tileWidth = IngameConfig.tileWidth;
  private readonly tileHeight = IngameConfig.tileHeight;
  private server!: Server;
  private room!: Room; // TODO: ここは後で型を定義する
  private player!: Player;

  constructor() {
    super('game');
    this.rows = IngameConfig.tileRows;
    this.cols = IngameConfig.tileCols;
  }

  init(data: any) {
    // preload の前に呼ばれる
    // initialize key inputs
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D,SPACE') as Keyboard),
    };

    this.server = data.server as Server;
    this.room = this.server.getRoom();
    this.player = this.server.getPlayer();
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
    this.myPlayer = this.add.myPlayer(this.player.x, this.player.y, 'player');
  }

  update() {
    if (this.cursors == null || this.myPlayer == null) return;
    this.myPlayer.update(this.server, this.cursors, this.player); // player controller handler
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
