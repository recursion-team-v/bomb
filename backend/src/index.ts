/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Server } from 'colyseus';
import { createServer } from 'http';
import { monitor } from "@colyseus/monitor";
import express from 'express';
import GameRoom from './rooms/GameRoom';
import * as Constants from '../../constants/constants';

const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
});

// TODO: add authentication
app.use("/monitor", monitor());
gameServer.define(Constants.GAME_ROOM_KEY, GameRoom);

// TODO: gracefully shutdown
gameServer.listen(Constants.SERVER_LISTEN_PORT).catch((err) => {
  console.error(err);
  process.exit(1);
});
