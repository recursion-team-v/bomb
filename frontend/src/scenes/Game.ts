/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';

// register to GameObjectFactory
import '../characters/MyPlayer';
import '../items/Bomb';
import '../items/InnerWall';
import '../items/Item';

import { createPlayerAnims } from '../anims/PlayerAnims';
import { generateGroundArray, generateWallArray } from '../utils/generateMap';
import { Keyboard } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import { createBombAnims } from '../anims/BombAnims';
import { createExplodeAnims } from '../anims/explodeAnims';
import * as Config from '../config/config';
import IngameConfig from '../config/ingameConfig';
import ScreenConfig from '../config/screenConfig';
import { ItemTypes } from '../types/items';
import { ObjectTypes } from '../types/objects';
import { Client, Room } from 'colyseus.js';
import * as Constants from '../../../backend/src/constants/constants';
import Player from '../../../backend/src/rooms/schema/Player';

export default class Game extends Phaser.Scene {
  private readonly client: Client;
  private room!: Room; // TODO: Room
  private readonly rows: number;
  private readonly cols: number;
  private readonly tileWidth = IngameConfig.tileWidth;
  private readonly tileHeight = IngameConfig.tileHeight;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly, @typescript-eslint/consistent-indexed-object-style
  private playerEntities: Map<string, MyPlayer> = new Map();
  private currentPlayer!: MyPlayer; // 操作しているプレイヤーオブジェクト
  private remoteRef!: Phaser.GameObjects.Rectangle; // サーバ側が認識するプレイヤーの位置を示す四角形

  inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('game');
    this.rows = IngameConfig.tileRows;
    this.cols = IngameConfig.tileCols;
    const protocol = window.location.protocol.replace('http', 'ws');

    if (import.meta.env.PROD) {
      const endpoint = Config.serverUrl;
      this.client = new Client(endpoint);
    } else {
      const endpoint = `${protocol}//${window.location.hostname}:${Constants.SERVER_LISTEN_PORT}`;
      this.client = new Client(endpoint);
    }
  }

  init() {
    // preload の前に呼ばれる
    // initialize key inputs
    this.cursorKeys = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D,SPACE') as Keyboard),
    };
  }

  async create() {
    console.log('game: create game');

    // connect with the room
    await this.connect();

    this.room.state.players.onAdd = (player: Player, sessionId: string) => {
      console.log('player add');
      if (player === undefined) return;

      const entity = this.add.myPlayer(player.x, player.y, 'player');
      this.playerEntities.set(sessionId, entity);

      // 変更されたのが自分の場合
      if (sessionId === this.room.sessionId) {
        this.currentPlayer = entity;

        // サーバ側が認識するプレイヤーの位置を示す四角形
        this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
        this.remoteRef.setStrokeStyle(1, 0xff0000);

        player.onChange = () => {
          // console.log('change');
          this.remoteRef.setPosition(player.x, player.y);
        };
      } else {
        const randomColor = Math.floor(Math.random() * 16777215);
        entity.setPlayerColor(randomColor);
        player.onChange = () => {
          // console.log('change');
          const localPlayer = this.playerEntities.get(sessionId);
          if (localPlayer === undefined) return;
          localPlayer.setData('serverX', player.x);
          localPlayer.setData('serverY', player.y);
        };
      }
    };

    // プレイヤーが切断した時
    this.room.state.players.onRemove = (player: Player, sessionId: string) => {
      const entity = this.playerEntities.get(sessionId);
      entity?.destroy();

      this.playerEntities.delete(sessionId);
      console.log('remove' + sessionId);
    };

    // add player animations
    createPlayerAnims(this.anims);
    createBombAnims(this.anims);
    createExplodeAnims(this.anims);

    // add map
    this.generateMap();

    // add items
    this.addItems();
    // this.addInnerWalls();
  }

  // 経過時間
  private elapsedTime: number = 0;

  // 1フレームの経過時間
  private readonly fixedTimeStep: number = Constants.FRAME_RATE;

  update(time: number, delta: number) {
    if (this.currentPlayer === undefined) return;

    // 前回の処理からの経過時間を算出し、1フレームの経過時間を超えていたら処理を実行する
    // https://learn.colyseus.io/phaser/4-fixed-tickrate.html
    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick();
    }
  }

  // 他のプレイヤーの移動処理
  private moveOtherPlayer() {
    this.playerEntities.forEach((localPlayer: MyPlayer, sessionId: string) => {
      if (localPlayer === undefined) return;
      if (sessionId === this.room.sessionId) return;

      // interpolate all player entities
      const { serverX, serverY } = localPlayer.data.values;

      const oldX = localPlayer.x;
      const oldY = localPlayer.y;

      // 線形補完(TODO: 調整)
      localPlayer.x = Phaser.Math.Linear(localPlayer.x, serverX, 0.2);
      localPlayer.y = Phaser.Math.Linear(localPlayer.y, serverY, 0.2);

      this.playerAnims(localPlayer, oldX, oldY);
    });
  }

  // 自分が操作するキャラの移動処理
  private moveOwnPlayer() {
    const p = this.currentPlayer;

    // send input to the server
    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown;

    this.room.send(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, this.inputPayload);

    const oldX = p.x;
    const oldY = p.y;

    const velocity = p.speed;
    if (this.inputPayload.left) {
      p.x -= velocity;
    } else if (this.inputPayload.right) {
      p.x += velocity;
    }

    if (this.inputPayload.up) {
      p.y -= velocity;
    } else if (this.inputPayload.down) {
      p.y += velocity;
    }

    this.playerAnims(p, oldX, oldY);
  }

  private fixedTick() {
    this.moveOwnPlayer();
    this.moveOtherPlayer();
  }

  // 移動アニメーション
  private playerAnims(localPlayer: MyPlayer, oldX: number, oldY: number) {
    const xDiff = localPlayer.x - oldX;
    const yDiff = localPlayer.y - oldY;

    if (xDiff > 0) localPlayer.play('player_right', true);
    else if (xDiff < 0) localPlayer.play('player_left', true);
    else if (yDiff > 0) localPlayer.play('player_down', true);
    else if (yDiff < 0) localPlayer.play('player_up', true);
    else localPlayer.stop();

    // bomb 設置
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);
    if (isSpaceJustDown) {
      localPlayer.placeBomb();
    }
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
      this.room = await this.client.joinOrCreate(Constants.GAME_ROOM_KEY, {});
    } catch (e) {
      console.error(e);
    }
  }
}
