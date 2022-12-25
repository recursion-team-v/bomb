/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';
import '../characters/MyPlayer';
import '../characters/Enemy';
import { createPlayerAnims } from '../anims/PlayerAnims';
import { generateGroundArray, generateWallArray } from '../utils/generateMap';
import { NavKeys, Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import Enemy from '../characters/Enemy';
import Config from '../config/config';

export default class Game extends Phaser.Scene {
  private myPlayer!: MyPlayer;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private enemies: Enemy[] = [];
  private cursors?: NavKeys;
  private readonly rows: number;
  private readonly cols: number;
  private readonly tileWidth = Config.tileWidth;
  private readonly tileHeight = Config.tileHeight;

  constructor() {
    super('game');
    this.rows = Config.tileRows;
    this.cols = Config.tileCols;
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

    // add map
    this.generateMap();

    // TODO: 雑に敵を増やす
    createPlayerAnims(this.anims, 'enemy');
    for (let i = 0; i < 5; i++) {
      this.enemies.push(
        this.add.enemy(
          Phaser.Math.Between(Config.availableMapStartX, Config.availableMapEndX),
          Phaser.Math.Between(Config.availableMapStartY, Config.availableMapEndY),
          'enemy',
          undefined,
          {
            chamfer: {
              radius: 10,
            },
          }
        )
      );
      this.enemies[i].setCollisionCategory(Config.otherPlayerCollisionCategory);
    }

    // add player animations
    createPlayerAnims(this.anims, 'player');

    // add myPlayer
    this.myPlayer = this.add.myPlayer(
      Config.playerWidth + Config.playerWidth / 2,
      Config.playerHeight + Config.playerHeight / 2 + Config.headerHeight,
      'player'
    );

    this.myPlayer.setCollisionCategory(Config.playerCollisionCategory);
    this.myPlayer.setCollidesWith(Config.playerCollidesWith);
  }

  update() {
    if (this.cursors == null || this.myPlayer == null) return;
    this.myPlayer.update(this.cursors); // player controller handler
    this.enemies.reduce((acc, enemy) => {
      enemy?.update(this.myPlayer.x, this.myPlayer.y);
      return acc;
    }, 0);
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
    groundMap.createLayer(0, 'tile_grounds', 0, Config.headerHeight);

    const wallMap = this.make.tilemap({
      data: wallArray,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
    });
    wallMap.addTilesetImage('tile_walls', undefined, this.tileWidth, this.tileHeight, 0, 0);
    const wallLayer = wallMap
      .createLayer(0, 'tile_walls', 0, Config.headerHeight)
      .setCollisionBetween(0, 50);
    this.matter.world.convertTilemapLayer(wallLayer);
  }
}
