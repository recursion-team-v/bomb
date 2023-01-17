/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { LobbyRoom, Server } from 'colyseus';
import { createServer } from 'http';
import { monitor } from '@colyseus/monitor';
import express from 'express';
import cors from 'cors';
import GameRoom from './rooms/GameRoom';
import * as Constants from './constants/constants';

// import する上手いやり方わからず require になってます
// eslint-disable-next-line @typescript-eslint/no-var-requires
const timesyncServer = require('timesync/server');

const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
});

// TODO: add authentication
app.use('/monitor', monitor());
gameServer.define(Constants.GAME_LOBBY_KEY, LobbyRoom);
gameServer.define(Constants.GAME_PUBLIC_ROOM_KEY, GameRoom, { name: 'public' });
gameServer.define(Constants.GAME_CUSTOM_ROOM_KEY, GameRoom).enableRealtimeListing();

// 時刻同期用
app.options('/timesync', cors());
app.use('/timesync', cors(), timesyncServer.requestHandler);

// TODO: add latency simulation
gameServer.simulateLatency(200);

// TODO: gracefully shutdown
gameServer.listen(Constants.SERVER_LISTEN_PORT).catch((err) => {
  console.error(err);
  process.exit(1);
});
