/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Server } from 'colyseus';
import { createServer } from 'http';
import express from 'express';
import { GameRoom } from './src/core/room';
import * as Constants from '../constants/constants';

const port = 3000;

const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
});

gameServer.define(Constants.GAME_ROOM_KEY, GameRoom);

// TODO: gracefully shutdown
gameServer.listen(port).catch((err) => {
  console.error(err);
  process.exit(1);
});
