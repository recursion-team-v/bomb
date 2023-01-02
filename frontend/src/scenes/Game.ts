/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';

// register to GameObjectFactory
import '../characters/MyPlayer';
import '../items/Bomb';
import '../items/InnerWall';
import '../items/Item';

import { createPlayerAnims } from '../anims/PlayerAnims';
import { generateGroundArray, generateWallArray } from '../utils/generateMap';
import { Keyboard, NavKeys } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import { createBombAnims } from '../anims/BombAnims';
import { createExplodeAnims } from '../anims/explodeAnims';
import * as Config from '../config/config';
import { ItemTypes } from '../types/items';
import { ObjectTypes } from '../types/objects';
import { Client, Room } from 'colyseus.js';
import * as Constants from '../../../backend/src/constants/constants';
import Player from '../../../backend/src/rooms/schema/Player';
import Bomb from '../items/Bomb';

export default class Game extends Phaser.Scene {
  private readonly client: Client;
  private room!: Room; // TODO: Room
  private readonly rows: number;
  private readonly cols: number;
  private readonly tileWidth = Constants.TILE_WIDTH;
  private readonly tileHeight = Constants.TILE_HEIGHT;
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

  cursorKeys!: NavKeys;

  constructor() {
    super('game');
    this.rows = Constants.TILE_ROWS;
    this.cols = Constants.TILE_COLS;
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
        this.remoteRef = this.add.rectangle(
          player.x,
          player.y,
          entity.width,
          entity.height,
          0xfff,
          0.3
        );

        player.onChange = () => {
          this.remoteRef.setPosition(player.x, player.y);

          // ずれが一定以上の場合は強制移動
          this.forceMovePlayerPosition(player);
        };
      } else {
        // プレイヤー同士はぶつからないようにする
        entity.setSensor(true);

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

  // 一定以上のズレなら強制同期
  private forceMovePlayerPosition(player: Player) {
    let forceX = 0;
    let forceY = 0;

    if (Math.abs(this.currentPlayer.x - player.x) > Constants.PLAYER_TOLERANCE_DISTANCE) {
      forceX = (this.currentPlayer.x - player.x) * -1;
    }

    if (Math.abs(this.currentPlayer.y - player.y) > Constants.PLAYER_TOLERANCE_DISTANCE) {
      forceY = (this.currentPlayer.y - player.y) * -1;
    }

    if (forceX === 0 && forceY === 0) return;
    console.log('force move');
    this.currentPlayer.setVelocity(forceX, forceY);
  }

  update(time: number, delta: number) {
    this.updateBombCollision();

    if (this.currentPlayer === undefined) return;

    // 前回の処理からの経過時間を算出し、1フレームの経過時間を超えていたら処理を実行する
    // https://learn.colyseus.io/phaser/4-fixed-tickrate.html
    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick();
    }
  }

  // ボム設置後、プレイヤーの挙動によってボムの衝突判定を更新する
  private updateBombCollision() {
    this.children.list.forEach((child: Phaser.GameObjects.GameObject) => {
      if (!(child instanceof Bomb)) return;

      const playerBody = this.currentPlayer.body as MatterJS.BodyType;
      if (child.isSensor() && !child.isOverlapping(this.matter, playerBody)) {
        child.updateCollision();
      }
    });
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
    this.inputPayload.left = this.cursorKeys.left.isDown || this.cursorKeys.A.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown || this.cursorKeys.D.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown || this.cursorKeys.W.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown || this.cursorKeys.S.isDown;

    let vx = 0; // velocity x
    let vy = 0; // velocity y

    const velocity = p.speed;
    if (this.inputPayload.left) {
      vx -= velocity;
    } else if (this.inputPayload.right) {
      vx += velocity;
    }

    if (this.inputPayload.up) {
      vy -= velocity;
    } else if (this.inputPayload.down) {
      vy += velocity;
    }

    p.setVelocity(vx, vy);

    this.room.send(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, p);

    if (vx > 0) p.play('player_right', true);
    else if (vx < 0) p.play('player_left', true);
    else if (vy > 0) p.play('player_down', true);
    else if (vy < 0) p.play('player_up', true);
    else p.stop();

    // bomb 設置
    const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);
    if (isSpaceJustDown) {
      this.room.send(Constants.NOTIFICATION_TYPE.PLAYER_BOMB, p);
      p.placeBomb();
    }

    // this.playerAnims(p, oldX, oldY);
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
    groundMap.createLayer(0, 'tile_grounds', 0, Constants.HEADER_HEIGHT);

    const wallMap = this.make.tilemap({
      data: wallArray,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
    });
    wallMap.addTilesetImage('tile_walls', undefined, this.tileWidth, this.tileHeight, 0, 0);
    const wallLayer = wallMap
      .createLayer(0, 'tile_walls', 0, Constants.HEADER_HEIGHT)
      .setCollisionBetween(0, 50);
    this.matter.world.convertTilemapLayer(wallLayer, { label: ObjectTypes.WALL });
  }

  private addInnerWalls() {
    for (let i = 1; i < Constants.TILE_ROWS; i++) {
      for (let j = 1; j < Constants.TILE_COLS - 3; j++) {
        if (i % 2 === 1 || j % 2 === 1) continue;
        this.add.innerWall(
          Constants.TILE_WIDTH * i + Constants.TILE_WIDTH / 2,
          Constants.TILE_HEIGHT * j + Constants.TILE_HEIGHT / 2 + Constants.HEADER_HEIGHT,
          'innerWall'
        );
      }
    }
  }

  private addItems() {
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
      ItemTypes.BOMB_STRENGTH
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
      ItemTypes.BOMB_STRENGTH
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
      ItemTypes.BOMB_STRENGTH
    );

    const bombPossessionUpCount = 10;
    for (let i = 0; i < bombPossessionUpCount; i++) {
      this.add.item(
        64 * Phaser.Math.Between(1, 13) + 32,
        64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
        ItemTypes.BOMB_POSSESSION_UP
      );
    }

    // this.add.item(
    //   64 * Phaser.Math.Between(1, 13) + 32,
    //   64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
    //   ItemTypes.PLAYER_SPEED
    // );
    // this.add.item(
    //   64 * Phaser.Math.Between(1, 13) + 32,
    //   64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
    //   ItemTypes.PLAYER_SPEED
    // );
    // this.add.item(
    //   64 * Phaser.Math.Between(1, 13) + 32,
    //   64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
    //   ItemTypes.PLAYER_SPEED
    // );
  }

  async connect() {
    try {
      this.room = await this.client.joinOrCreate(Constants.GAME_ROOM_KEY, {});
    } catch (e) {
      console.error(e);
    }
  }
}
