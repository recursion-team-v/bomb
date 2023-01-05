import { Client, Room, RoomAvailable } from 'colyseus.js';
import GameRoomState from '../../../backend/src/rooms/schema/GameRoomState';
import * as Config from '../config/config';
import * as Constants from '../../../backend/src/constants/constants';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import { Bomb as ServerBomb } from '../../../backend/src/rooms/schema/Bomb';
import { gameEvents, Event } from '../events/GameEvents';

export default class Network {
  private readonly client: Client;
  public room?: Room<GameRoomState>;

  allRooms: RoomAvailable[] = [];
  mySessionId!: string;

  constructor() {
    const protocol = window.location.protocol.replace('http', 'ws');

    if (import.meta.env.PROD) {
      const endpoint = Config.serverUrl;
      this.client = new Client(endpoint);
    } else {
      const endpoint = `${protocol}//${window.location.hostname}:${Constants.SERVER_LISTEN_PORT}`;
      this.client = new Client(endpoint);
    }
    this.joinOrCreateRoom().catch((err) => console.log(err));
  }

  async joinOrCreateRoom() {
    this.room = await this.client.joinOrCreate(Constants.GAME_ROOM_KEY);
    // ゲーム開始の通知
    // FIXME: ここでやるのではなくロビーでホストがスタートボタンを押した時にやる
    this.room.send(Constants.NOTIFICATION_TYPE.GAME_PROGRESS);
    this.initialize();
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

    this.room.state.timer.onChange = (data: any) => {
      gameEvents.emit(Event.TIMER_UPDATED, data);
    };

    this.room.state.gameState.onChange = (data: any) => {
      gameEvents.emit(Event.GAME_STATE_UPDATED, data);
    };
  }

  // 自分がルームに参加した時
  onMyPlayerJoinedRoom(callback: (player: ServerPlayer, sessionId: string) => void, context?: any) {
    gameEvents.on(Event.MY_PLAYER_JOINED_ROOM, callback, context);
  }

  // 他のプレイヤーがルームに参加した時
  onPlayerJoinedRoom(callback: (player: ServerPlayer, sessionId: string) => void, context?: any) {
    gameEvents.on(Event.PLAYER_JOINED_ROOM, callback, context);
  }

  // プレイヤーがルームを退出した時
  onPlayerLeftRoom(callback: (player: ServerPlayer, sessionId: string) => void, context?: any) {
    gameEvents.on(Event.PLAYER_LEFT_ROOM, callback, context);
  }

  // 他のプレイヤーがボムを追加した時
  onBombAdded(callback: (bomb: ServerBomb) => void, context?: any) {
    gameEvents.on(Event.BOMB_ADDED, callback, context);
  }

  // タイマーが更新された時
  onTimerUpdated(callback: (data: any) => void, context?: any) {
    gameEvents.on(Event.TIMER_UPDATED, callback, context);
  }

  // gameState が更新された時
  onGameStateUpdated(callback: (data: any) => Promise<void>, context?: any) {
    gameEvents.on(Event.GAME_STATE_UPDATED, callback, context);
  }
}
