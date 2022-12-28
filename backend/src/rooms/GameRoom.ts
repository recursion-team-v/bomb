import { Client, Room } from 'colyseus';

import GameRoomState from './schema/GameRoomState';

export default class GameRoom extends Room<GameRoomState> {
  onCreate(options: any) {
    this.setState(new GameRoomState());

    this.onMessage('move', (client, data) => {
      this.state.updatePlayer(client.sessionId, data);
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');

    // create Player instance
    this.state.createPlayer(client.sessionId);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }
}
