/* eslint-disable import/no-duplicates */
import Phaser from 'phaser';

// register to GameObjectFactory
import '../characters/MyPlayer';
import '../items/Bomb';
import '../items/Wall';
import '../items/Item';

import { createPlayerAnims } from '../anims/PlayerAnims';
import { drawGround, drawWalls, drawBlocks } from '../utils/drawMap';
import { NavKeys } from '../types/keyboard';
import MyPlayer from '../characters/MyPlayer';
import { createBombAnims } from '../anims/BombAnims';
import { createExplodeAnims } from '../anims/explodeAnims';
import * as Config from '../config/config';
import { Client, Room } from 'colyseus.js';
import * as Constants from '../../../backend/src/constants/constants';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import { Bomb as ServerBomb } from '../../../backend/src/rooms/schema/Bomb';
import GameRoomState from '../../../backend/src/rooms/schema/GameRoomState';
import Bomb from '../items/Bomb';
import GameHeader from './GameHeader';
import initializeKeys from '../utils/key';

export default class Game extends Phaser.Scene {
  private readonly client: Client;
  private room!: Room<GameRoomState>;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly, @typescript-eslint/consistent-indexed-object-style
  private playerEntities: Map<string, MyPlayer> = new Map();
  private currentPlayer!: MyPlayer; // 操作しているプレイヤーオブジェクト
  public blockMap?: number[][];

  private remoteRef!: Phaser.GameObjects.Rectangle; // サーバ側が認識するプレイヤーの位置を示す四角形

  inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  cursorKeys!: NavKeys;

  constructor() {
    super(Config.SCENE_NAME_GAME);
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
    // initialize key inputs
    this.cursorKeys = initializeKeys(this);
  }

  async create() {
    console.log('game: create game');
    // connect with the room
    await this.connect().then(() => {
      // ゲーム開始の通知
      // FIXME: ここでやるのではなくロビーでホストがスタートボタンを押した時にやる
      this.room.send(Constants.NOTIFICATION_TYPE.GAME_PROGRESS);
    });

    // タイマーの変更イベント
    this.room.state.timer.onChange = (data) => this.timerChangeEvent(data);

    // ゲームの状態の変更イベント
    this.room.state.gameState.onChange = async (data) => await this.gameStateChangeEvent(data);
    // 爆弾が追加された時の処理
    // TODO: アイテムをとって火力が上がった場合の処理を追加する
    this.room.state.bombs.onAdd = (serverBomb: ServerBomb) => this.addBombEvent(serverBomb);

    // プレイヤーが追加された時の処理
    this.room.state.players.onAdd = (player: ServerPlayer, sessionId: string) => {
      console.log('player add');
      if (player === undefined) return;

      const entity = this.add.myPlayer(sessionId, player.x, player.y, 'player');
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
          localPlayer.setData('frameKey', player.frameKey);
        };
      }
    };

    // プレイヤーが切断した時
    this.room.state.players.onRemove = (player: ServerPlayer, sessionId: string) => {
      const entity = this.playerEntities.get(sessionId);
      entity?.destroy();

      this.playerEntities.delete(sessionId);
      console.log('remove' + sessionId);
    };

    // add player animations
    createPlayerAnims(this.anims);
    createBombAnims(this.anims);
    createExplodeAnims(this.anims);

    this.room.onStateChange.once((state) => {
      // GameRoomState の blockArr が初期化されたら block（破壊）を描画
      const mapTiles = state.gameMap.mapTiles;

      // draw ground
      drawGround(this, mapTiles.GROUND_IDX);
      // draw walls
      drawWalls(this, mapTiles);
      // draw blocks

      this.blockMap = drawBlocks(this, state.gameMap.blockArr);
      state.items.forEach((item) => {
        this.add.item(
          Constants.TILE_WIDTH / 2 + Constants.TILE_WIDTH * item.x,
          Constants.TILE_HEIGHT / 2 + Constants.TILE_HEIGHT * item.y,
          item.itemType
        );
      });
    });
  }

  // 経過時間
  private elapsedTime: number = 0;

  // 1フレームの経過時間
  private readonly fixedTimeStep: number = Constants.FRAME_RATE;

  // 一定以上のズレなら強制同期
  private forceMovePlayerPosition(player: ServerPlayer) {
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
      const { serverX, serverY, frameKey } = localPlayer.data.values;

      // 線形補完(TODO: 調整)
      localPlayer.x = Math.ceil(Phaser.Math.Linear(localPlayer.x, serverX, 0.35)); // 動きがちょっと滑らか過ぎるから 0.2 -> 0.35
      localPlayer.y = Math.ceil(Phaser.Math.Linear(localPlayer.y, serverY, 0.35));

      // playerState の frameKey を使ってアニメーションを描画
      localPlayer.setFrame(frameKey);
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
      p.placeBomb(this.matter);
    }
  }

  private fixedTick() {
    this.moveOwnPlayer();
    this.moveOtherPlayer();
  }

  private addItems() {
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
      Constants.ITEM_TYPE.BOMB_STRENGTH
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
      Constants.ITEM_TYPE.BOMB_STRENGTH
    );
    this.add.item(
      64 * Phaser.Math.Between(1, 13) + 32,
      64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
      Constants.ITEM_TYPE.BOMB_STRENGTH
    );

    const bombPossessionUpCount = 10;
    for (let i = 0; i < bombPossessionUpCount; i++) {
      this.add.item(
        64 * Phaser.Math.Between(1, 13) + 32,
        64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
        Constants.ITEM_TYPE.BOMB_POSSESSION_UP
      );
    }

    // this.add.item(
    //   64 * Phaser.Math.Between(1, 13) + 32,
    //   64 * Phaser.Math.Between(1, 11) + Constants.HEADER_HEIGHT + 32,
    //   ItemTypes.PLAYER_SPEED
    // );
  }

  // タイマーが更新されたイベント
  private timerChangeEvent(data: any) {
    const sc = this.scene.get(Config.SCENE_NAME_GAME_HEADER) as GameHeader;
    data.forEach((v: any) => {
      if (v.field === 'remainTime') sc.updateTimerText(v.value);
    });
  }

  // ゲームステートが更新されたイベント
  private async gameStateChangeEvent(data: any) {
    const state = data[0].value as Constants.GAME_STATE_TYPE;

    if (state === Constants.GAME_STATE.FINISHED) {
      await this.room.leave();
      this.scene.stop(Config.SCENE_NAME_GAME_HEADER);
      this.scene.stop(Config.SCENE_NAME_GAME);
      this.scene.start(Config.SCENE_NAME_GAME_RESULT);
    }
  }

  public getCurrentPlayer(): MyPlayer {
    return this.currentPlayer;
  }

  async connect() {
    try {
      this.room = await this.client.joinOrCreate(Constants.GAME_ROOM_KEY, {});
    } catch (e) {
      console.error(e);
    }
  }

  /*
  event 系
  */

  // ボム追加イベント時に、マップにボムを追加
  private addBombEvent(serverBomb: ServerBomb) {
    if (serverBomb === undefined) return;

    const sessionId = serverBomb.owner.sessionId;

    // 自分のボムは表示しない
    if (this.currentPlayer.isEqualSessionId(sessionId)) return;

    const player = this.playerEntities.get(sessionId);
    if (player === undefined) return;

    this.add.bomb(sessionId, serverBomb.x, serverBomb.y, serverBomb.bombStrength, player);
  }
}
