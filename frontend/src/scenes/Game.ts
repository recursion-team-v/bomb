/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';

// register to GameObjectFactory
import '../characters/MyPlayer';
import '../items/Bomb';
import '../items/InnerWall';
import '../items/Item';

import { createPlayerAnims } from '../anims/PlayerAnims';
import { generateGroundArray, generateWallArray } from '../utils/generateMap';
import { NavKeys, Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import { createBombAnims } from '../anims/BombAnims';
import { createExplodeAnims } from '../anims/explodeAnims';
import IngameConfig from '../config/ingameConfig';
import ScreenConfig from '../config/screenConfig';
import { ItemTypes } from '../types/items';
import { ObjectTypes } from '../types/objects';
import { Client, Room } from 'colyseus.js';

export default class Game extends Phaser.Scene {

  private readonly client: Client;
  private room: Room; // TODO: Room
  private myPlayer?: MyPlayer;
  private cursors?: NavKeys;
  private readonly rows: number;
  private readonly cols: number;
  private readonly tileWidth = IngameConfig.tileWidth;
  private readonly tileHeight = IngameConfig.tileHeight;
  private playerEntities: { [sessionId: string]: any } = {};

  constructor() {
    super('game');
    this.rows = IngameConfig.tileRows;
    this.cols = IngameConfig.tileCols;
    const protocol = window.location.protocol.replace('http', 'ws');
    const endpoint = `${protocol}//${window.location.hostname}:2567`; // TODO: production 対応

    this.client = new Client(endpoint);
  }

  init() {
    // preload の前に呼ばれる
    // initialize key inputs
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D,SPACE') as Keyboard),
    };
  }

  async create() {
    console.log('game: create game');

    // connect with the room
    await this.connect();

    this.room.state.players.onAdd = function (player, sessionId) {
      console.log('add')
      // this.playerEntities[sessionId] = player;

      // listening for server updates
      player.onChange = function (changes) {
        console.log("change")
      }
    };

    this.room.state.players.onRemove = function (player, sessionId) {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        // destroy entity
        entity.destroy();

        // clear local reference
        delete this.playerEntities[sessionId];
      }
    };

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

    // add items
    this.addItems();
    this.addInnerWalls();
  }

  update() {
    if (this.cursors == null || this.myPlayer == null) return;
    this.myPlayer.update(this.cursors, this.room); // player controller handler
  }

  // TODO: move outside Game.ts
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
    this.matter.world.convertTilemapLayer(wallLayer, { label: ObjectTypes.WALL });
  }

  private addInnerWalls() {
    for (let i = 1; i < IngameConfig.tileRows; i++) {
      for (let j = 1; j < IngameConfig.tileCols - 3; j++) {
        if (i % 2 === 1 || j % 2 === 1) continue;
        this.add.innerWall(
          IngameConfig.tileWidth * i + IngameConfig.tileWidth / 2,
          IngameConfig.tileHeight * j + IngameConfig.tileHeight / 2 + ScreenConfig.headerHeight,
          IngameConfig.keyInnerWall
        );
      }
    }
  }

  private addItems() {
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + ScreenConfig.headerHeight + 32,
      ItemTypes.BOMB_STRENGTH
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + ScreenConfig.headerHeight + 32,
      ItemTypes.BOMB_STRENGTH
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + ScreenConfig.headerHeight + 32,
      ItemTypes.BOMB_STRENGTH
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + ScreenConfig.headerHeight + 32,
      ItemTypes.PLAYER_SPEED
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + ScreenConfig.headerHeight + 32,
      ItemTypes.PLAYER_SPEED
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + ScreenConfig.headerHeight + 32,
      ItemTypes.PLAYER_SPEED
    );
  }

  async connect() {
    try {
      this.room = await this.client.joinOrCreate("my_room", {});
    } catch (e) {
      console.error(e);
    }
  }

}
