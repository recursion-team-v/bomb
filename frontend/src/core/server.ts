import { Client, Room } from 'colyseus.js';
import { GAME_ROOM_KEY } from '../../../constants/constants';
import * as Constants from '../../../constants/constants';
import { Player } from '../../../backend/src/core/player';

export default class Server {
  private readonly client: Client;
  private room!: Room; // TODO: Room
  private player!: Player; // TODO: player

  constructor() {
    const protocol = window.location.protocol.replace('http', 'ws');
    const endpoint = `${protocol}//${window.location.hostname}:3000`; // TODO: production 対応

    this.client = new Client(endpoint);
  }

  getRoom() {
    return this.room;
  }

  getPlayer() {
    return this.player;
  }

  async join() {
    await this.client
      .joinOrCreate(GAME_ROOM_KEY)
      .then((room) => {
        console.log(room.sessionId, 'joined', room.name);
        this.room = room;

        this.room.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_INFO, (data: any) => {
          this.player = data;
        });
      })
      .catch((e) => {
        // TODO: タイトルに戻る
        console.log('JOIN ERROR', e);
      });
  }

  send(type: number, data: any) {
    this.room.send(type, data);
  }
}
