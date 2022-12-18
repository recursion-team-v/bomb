import * as http from 'http';

import { port } from '../config/config';

export const listen = () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World Node.js x TypeScript');
  });
  server.listen(port);

  console.log(`Server running at http://localhost:${port}/`);
};
