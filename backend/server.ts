import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

const app: express.Express = express();
const server: http.Server = http.createServer(app);
const io: Server = new Server(server);

const players: Record<number, Player> = {};

app.use(express.static(path.join(__dirname, '/public')));





app.get('/', function (req: express.Request<any>, res: express.Response<any>) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

io.on('connection', function (socket: any) {
  console.log('a user connected');

  // create a new player and add it to our players object
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
  };

  // send the players object to the new player
  socket.emit('currentPlayers', players);

  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnected', socket.id);
  });

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData: Player) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
});

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
const port = process.env.PORT ?? 8081;
server.listen(port, function () {
  console.log(`Listening on ${port} `);
});

class Player {
  constructor(
    public x: number,
    public y: number,
    public rotation: number,
    public playerId: string
  ) {}
}
