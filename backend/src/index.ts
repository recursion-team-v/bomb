/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { monitor } from '@colyseus/monitor';
import { LobbyRoom, Server } from 'colyseus';
import cors from 'cors';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { createServer } from 'http';

import * as Constants from './constants/constants';
import GameRoom from './rooms/GameRoom';

// サーバがデバッグモードかどうか
export const IS_BACKEND_DEBUG = process.env.TS_NODE_DEV === 'true';

// import する上手いやり方わからず require になってます
// eslint-disable-next-line @typescript-eslint/no-var-requires
const timesyncServer = require('timesync/server');

const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
});

const adminPassword = process.env.ADMIN_PASSWORD ?? Constants.DEBUG_ADMIN_PASSWORD;
const basicAuthMiddleware = basicAuth({
  users: {
    admin: adminPassword,
  },
  challenge: true,
});

app.use('/monitor', basicAuthMiddleware, monitor());
gameServer.define(Constants.GAME_LOBBY_KEY, LobbyRoom);
// gameServer.define(Constants.GAME_PUBLIC_ROOM_KEY, GameRoom, { name: 'public' });
gameServer.define(Constants.GAME_CUSTOM_ROOM_KEY, GameRoom).enableRealtimeListing();

// 時刻同期用
app.options('/timesync', cors());
app.use('/timesync', cors(), timesyncServer.requestHandler);

// TODO: add latency simulation
// gameServer.simulateLatency(200);

// TODO: gracefully shutdown
gameServer.listen(Constants.SERVER_LISTEN_PORT).catch((err) => {
  console.error(err);
  process.exit(1);
});
