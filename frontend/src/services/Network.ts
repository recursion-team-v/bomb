import { Client, Room, RoomAvailable } from 'colyseus.js';
import GameRoomState from '../../../backend/src/rooms/schema/GameRoomState';
import * as Config from '../config/config';
import * as Constants from '../../../backend/src/constants/constants';
import Player from '../../../backend/src/rooms/schema/Player';
import { phaserEvents, Event } from '../events/PhaserEvents';

export default class Network {
  private readonly client: Client;
  public room?: Room<GameRoomState>;
  public lobby?: Room;

  allRooms: RoomAvailable[] = [];
  mySessionId?: string;

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
    if (this.room == null || this.lobby == null) return;

    this.mySessionId = this.room.sessionId;

    this.room.state.players.onAdd = (player: Player, sessionId: string) => {
      if (sessionId === this.mySessionId) {
        console.log('myPlayer joined');
      } else {
        console.log('otherPlayer joined');
      }
      phaserEvents.emit(Event.PLAYER_JOINED_ROOM, player, sessionId);
    };

    this.room.state.players.onRemove = (player: Player, sessionId: string) => {
      phaserEvents.emit(Event.PLAYER_LEFT_ROOM, player, sessionId);
    };
  }

  // プレイヤーがルームに参加した時の callback を定義する
  onPlayerJoinedRoom(callback: (player: Player, sessionId: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_JOINED_ROOM, callback, context);
  }

  // プレイヤーがルームを退出した時の callback を定義する
  onPlayerLeftRoom(callback: (player: Player, sessionId: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_LEFT_ROOM, callback, context);
  }
}
