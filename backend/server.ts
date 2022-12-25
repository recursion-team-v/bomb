/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Server, Client, Room } from 'colyseus';
import { createServer } from 'http';
import express from 'express';
import { Schema, MapSchema, type } from '@colyseus/schema';
const port = 3000;

const app = express();
app.use(express.json());

// An abstract player object, demonstrating a potential 2D world position
export class Player extends Schema {
  @type('number')
  x: number = 0.11;

  @type('number')
  y: number = 2.22;
}

// Our custom game state, an ArraySchema of type Player only at the moment
export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
}

class GameRoom extends Room {
  // Colyseus will invoke when creating the room instance
  onCreate(options: any) {
    // initialize empty room state
    this.setState(new State());

    // Called every time this room receives a "move" message
    this.onMessage('move', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      player.x += data.x;
      player.y += data.y;
      console.log(client.sessionId + ' at, x: ' + player.x, 'y: ' + player.y);
    });
  }

  // Called every time a client joins
  onJoin(client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player());
  }
}

const gameServer = new Server({
  server: createServer(app),
});

gameServer.define('game', GameRoom);

// TODO: gracefully shutdown
gameServer.listen(port).catch((err) => {
  console.error(err);
  process.exit(1);
});
