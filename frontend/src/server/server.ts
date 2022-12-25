import { Client, Room } from 'colyseus.js';

export default class Server {
  private readonly client: Client;
  private room: any; // TODO: Room

  constructor() {
    this.client = new Client('ws://localhost:3000');
  }

  async join() {
    this.room = await this.client
      .joinOrCreate('game')
      .then((room) => {
        console.log(room.sessionId, 'joined', room.name);
      })
      .catch((e) => {
        console.log('JOIN ERROR', e);
      });
  }
}
