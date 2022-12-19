import { port } from '../config/config';

export const listen = () => {
  const app = require('express')();
  const http = require('http').Server(app);
  const io = require('socket.io')(http);

  app.get('/', (req: any, res: { sendFile: (arg0: string) => void }) => {
    res.sendFile(__dirname + '/index.html');
  });

  io.on('connection', (socket: { on: (arg0: string, arg1: (msg: any) => void) => void }) => {
    socket.on('chat message', (msg: any) => {
      io.emit('chat message', msg);
    });
  });

  http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
  });

  // const server = http.createServer((req, res) => {
  //   res.writeHead(200, { 'Content-Type': 'text/plain' });
  //   res.end('Hello World Node.js x TypeScript');
  // });
  // server.listen(port);

  // console.log(`Server running at http://localhost:${port}/`);
};
