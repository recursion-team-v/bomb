import { Client, Room, RoomAvailable } from 'colyseus.js';
import GameRoomState from '../../../backend/src/rooms/schema/GameRoomState';
import * as Config from '../config/config';
import * as Constants from '../../../backend/src/constants/constants';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import ServerItem from '../../../backend/src/rooms/schema/Item';
import ServerBlock from '../../../backend/src/rooms/schema/Block';
import ServerBlast from '../../../backend/src/rooms/schema/Blast';
import ServerTimer from '../../../backend/src/rooms/schema/Timer';
import { Bomb as ServerBomb } from '../../../backend/src/rooms/schema/Bomb';
import { gameEvents, Event } from '../events/GameEvents';
import MyPlayer from '../characters/MyPlayer';
import Player from '../characters/Player';
import TimeSync, { create as TimeCreate } from 'timesync';

export default class Network {
  private readonly client: Client;
  private ts!: TimeSync;
  public room?: Room<GameRoomState>;

  allRooms: RoomAvailable[] = [];
  mySessionId!: string;

  constructor() {
    const protocol = window.location.protocol.replace('http', 'ws');

    let endpoint = '';
    if (import.meta.env.PROD) {
      endpoint = Config.SERVER_URL;
      this.client = new Client(endpoint);
    } else {
      endpoint = `${protocol}//${window.location.hostname}:${Constants.SERVER_LISTEN_PORT}`;
      this.client = new Client(endpoint);
    }
    this.syncClock(endpoint);
    this.joinOrCreateRoom().catch((err) => console.log(err));
  }

  syncClock(endpoint: string) {
    endpoint = endpoint.replace('ws', 'http');
    this.ts = TimeCreate({
      server: `${endpoint}/timesync`,
      interval: Config.TIME_SYNC_INTERVAL,
    });
    this.ts.sync();
  }

  getTs(): TimeSync {
    return this.ts;
  }

  now(): number {
    return this.ts.now();
  }

  async joinOrCreateRoom() {
    this.room = await this.client.joinOrCreate(Constants.GAME_ROOM_KEY);

    // ゲーム開始の通知
    // FIXME: ここでやるのではなくロビーでホストがスタートボタンを押した時にやる
    this.initialize();
    this.receiveGameStartInfo(this.handleGameStartInfoReceived, this);

    // ゲーム開始情報の受信イベント
    // FIXME: ここでやるのではなくロビーでホストがスタートボタンを押した時にやる
    this.sendGameProgress(Constants.GAME_STATE.PLAYING);
  }

  initialize() {
    if (this.room == null) return;

    this.mySessionId = this.room.sessionId;

    this.room.state.players.onAdd = (player: ServerPlayer, sessionId: string) => {
      if (sessionId === this.mySessionId) {
        gameEvents.emit(Event.MY_PLAYER_JOINED_ROOM, player, sessionId);
        return;
      }
      gameEvents.emit(Event.PLAYER_JOINED_ROOM, player, sessionId);
    };

    this.room.state.players.onRemove = (player: ServerPlayer, sessionId: string) => {
      gameEvents.emit(Event.PLAYER_LEFT_ROOM, player, sessionId);
    };

    this.room.state.bombs.onAdd = (bomb: ServerBomb) => {
      gameEvents.emit(Event.BOMB_ADDED, bomb);
    };

    this.room.state.bombs.onRemove = (bomb: ServerBomb) => {
      gameEvents.emit(Event.BOMB_REMOVED, bomb);
    };

    this.room.state.blasts.onAdd = (data: any) => {
      gameEvents.emit(Event.BLAST_ADDED, data);
    };

    this.room.state.blasts.onRemove = (data: any) => {
      gameEvents.emit(Event.BLAST_REMOVED, data);
    };

    this.room.state.gameState.onChange = (data: any) => {
      gameEvents.emit(Event.GAME_STATE_UPDATED, data);
    };

    this.room.state.blocks.onRemove = (data: ServerBlock) => {
      gameEvents.emit(Event.BLOCKS_REMOVED, data);
    };

    this.room.state.items.onAdd = (data: any) => {
      gameEvents.emit(Event.ITEM_ADDED, data);
    };

    this.room.state.items.onRemove = (data: ServerItem) => {
      gameEvents.emit(Event.ITEM_REMOVED, data);
    };

    this.room.onMessage(Constants.NOTIFICATION_TYPE.GAME_START_INFO, (data: ServerTimer) => {
      gameEvents.emit(Event.GAME_START_INFO_RECEIVED, data);
    });
  }

  // 自分がルームに参加した時
  onMyPlayerJoinedRoom(callback: (player: ServerPlayer, sessionId: string) => void, context?: any) {
    gameEvents.on(Event.MY_PLAYER_JOINED_ROOM, callback, context);
  }

  // 他のプレイヤーがルームに参加した時
  onPlayerJoinedRoom(callback: (player: ServerPlayer, sessionId: string) => void, context?: any) {
    gameEvents.on(Event.PLAYER_JOINED_ROOM, callback, context);
  }

  // 他のプレイヤーがルームを退出した時
  onPlayerLeftRoom(callback: (player: ServerPlayer, sessionId: string) => void, context?: any) {
    gameEvents.on(Event.PLAYER_LEFT_ROOM, callback, context);
  }

  // プレイヤーがボムを追加した時
  onBombAdded(callback: (bomb: ServerBomb) => void, context?: any) {
    gameEvents.on(Event.BOMB_ADDED, callback, context);
  }

  onBombRemoved(callback: (bomb: ServerBomb) => void, context?: any) {
    gameEvents.on(Event.BOMB_REMOVED, callback, context);
  }

  // 爆風が追加された時
  onBlastAdded(callback: (blast: ServerBlast) => void, context?: any) {
    gameEvents.on(Event.BLAST_ADDED, callback, context);
  }

  // 爆風が消去（破壊）された時
  onBlastRemoved(callback: (data: any) => void, context?: any) {
    gameEvents.on(Event.BLAST_REMOVED, callback, context);
  }

  // gameState が更新された時
  onGameStateUpdated(callback: (data: any) => Promise<void>, context?: any) {
    gameEvents.on(Event.GAME_STATE_UPDATED, callback, context);
  }

  // blocks が消去（破壊）された時
  onBlocksRemoved(callback: (data: ServerBlock) => void, context?: any) {
    gameEvents.on(Event.BLOCKS_REMOVED, callback, context);
  }

  onItemAdded(callback: (item: ServerItem) => void, context?: any) {
    gameEvents.on(Event.ITEM_ADDED, callback, context);
  }

  // item が消去（破壊）された時
  onItemRemoved(callback: (data: ServerItem) => void, context?: any) {
    gameEvents.on(Event.ITEM_REMOVED, callback, context);
  }

  // ゲーム開始に関する情報を受け取った時
  receiveGameStartInfo(callback: (data: any) => void, context?: any) {
    gameEvents.on(Event.GAME_START_INFO_RECEIVED, callback, context);
  }

  // 自分のプレイヤー動作を送る
  sendPlayerMove(player: Player, inputPayload: any, isInput: boolean) {
    this.room?.send(Constants.NOTIFICATION_TYPE.PLAYER_MOVE, { player, inputPayload, isInput });
  }

  // 自分の爆弾を送る
  sendPlayerBomb(player: MyPlayer) {
    this.room?.send(Constants.NOTIFICATION_TYPE.PLAYER_BOMB, player);
  }

  // プレイヤーの名前を送る
  sendPlayerName(playerName: string) {
    this.room?.send(Constants.NOTIFICATION_TYPE.PLAYER_INFO, playerName);
  }

  // 自分のゲーム状態を送る
  sendGameProgress(state: Constants.GAME_STATE_TYPE) {
    this.room?.send(Constants.NOTIFICATION_TYPE.GAME_PROGRESS, state);
  }

  // ゲーム開始情報の取得リクエストを送る
  sendRequestGameStartInfo() {
    this.room?.send(Constants.NOTIFICATION_TYPE.GAME_START_INFO);
  }

  // FIXME:
  // 本来はここにおくべきではなく、ロビー画面でゲーム開始ボタンを押した時にやればいいのだが
  // まだロビーがないのでここにおく
  private gameStartedAt!: number; // ゲームの開始時間
  private gameFinishedAt!: number; // ゲームの終了時間

  private handleGameStartInfoReceived(data: ServerTimer) {
    this.gameStartedAt = data.startedAt;
    this.gameFinishedAt = data.finishedAt;
  }

  public getGameStartedAt(): number {
    return this.gameStartedAt;
  }

  public getGameFinishedAt(): number {
    return this.gameFinishedAt;
  }

  public remainTime(): number {
    return this.gameFinishedAt - this.now();
  }
}
