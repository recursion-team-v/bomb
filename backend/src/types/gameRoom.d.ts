// ルーム作成時 onCreate に渡されるデータの型
export interface IRoomCreateData {
  name: string;
  password: string | null;
  autoDispose: boolean;
  playerName: string;
}

// ゲーム開始時にクライアントに送るデータの型
export interface IGameStartInfo {
  serverTimer: ServerTimer;
}

// ゲーム準備完了時に渡されるデータの型
export interface IGameSettings {
  mapRows: number;
  mapCols: number;
}

// 全クライアントがゲーム準備完了後に送るデータの型（blocks をJSON形式にシリアライズしたもの）
export interface ISerializedGameData {
  blocks: string | undefined;
  mapRows: number | undefined;
  mapCols: number | undefined;
}

// クライアントで使うゲームデータ型
export interface IGameData {
  blocks: Map<string, ServerBlock> | undefined;
  mapRows: number | undefined;
  mapCols: number | undefined;
}
