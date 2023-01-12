/* eslint-disable @typescript-eslint/method-signature-style */
declare module 'timesync' {
  interface TimeSync {
    destroy();
    now(): number;
    on(event: 'change', callback: (offset: number) => void);
    on(event: 'error', callback: (err: any) => void);
    on(event: 'sync', callback: (value: 'start' | 'end') => void);
    off(event: 'change' | 'error' | 'sync', callback?: () => void);
    sync();

    send(to: string, data: object, timeout: number): Promise<void>;
    receive(from: string, data: object);
  }

  interface TimeSyncCreateOptions {
    interval?: number;
    timeout?: number;
    delay?: number;
    repeat?: number;
    peers?: string | string[];
    server?: string;
    now?: () => number;
  }

  export function create(options: TimeSyncCreateOptions): TimeSync;

  export = TimeSync;
}

declare module 'timesync/server' {
  import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
  import type { createServer as createHttpServer, Server } from 'http';
  function requestHandler(req: Request | ExpressRequest, res: Response | ExpressResponse): void;

  function createServer(): ReturnType<typeof createHttpServer>;

  function attachServer(server: Server, path?: string): void;
}
