export interface IRoomData {
  name: string;
  password: string | null;
  autoDispose: boolean;
  playerName: string;
}

export interface IGameStartInfo {
  serverTimer: ServerTimer;
}

export interface IGameSettings {
  mapRows: number;
  mapCols: number;
}

export interface IGameData {
  blocks: Map<string, ServerBlock> | undefined;
  mapRows: number | undefined;
  mapCols: number | undefined;
}
