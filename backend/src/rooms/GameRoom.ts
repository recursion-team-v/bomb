import { Client, Room } from 'colyseus';

import GameRoomState from './schema/GameRoomState';
import Player from './schema/Player';

export default class GameRoom extends Room<GameRoomState> {

  onCreate(options: any) {
    this.setState(new GameRoomState());

    this.onMessage('move', (client, message) => {
      this.state.updatePlayer(client.sessionId, message.vx, message.vy);
    });

  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    // create Player instance
    const player = new Player();

    // place player in the map of players by its sessionId
    // (client.sessionId is unique per connection!)
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
