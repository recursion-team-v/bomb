import { Client, Room } from 'colyseus.js';

import { Player } from '../../../backend/src/core/player';
import { GAME_ROOM_KEY } from '../../../constants/constants';
import * as Constants from '../../../constants/constants';

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
      .then((room: Room) => {
        this.room = room;

        this.room.state.players.onAdd = (player) => {
          player.onChange = (changes) => {
            changes.forEach((change) => {
              if (change.field === 'x') this.player.x = change.value;
              if (change.field === 'y') this.player.y = change.value;
              if (change.field === 'vx') this.player.vx = change.value;
              if (change.field === 'vy') this.player.vy = change.value;
              console.log(change.field, change.value);
            });
          };
        };

        room.onMessage(Constants.NOTIFICATION_TYPE.PLAYER_INFO, (data: any) => {
          this.player = data;
          console.log(data);
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
