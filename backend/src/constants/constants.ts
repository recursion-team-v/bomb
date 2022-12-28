export const FPS = 60; // 1 秒間のフレーム数
export const FRAME_RATE = 1000 / FPS; // 1 frame にかかる時間(ms)

// ゲームルーム参加時に使用するキー
export const SERVER_LISTEN_PORT = 2567;
export const GAME_ROOM_KEY = 'game';

export const NOTIFICATION_TYPE = {
  // 1 番台はゲーム情報を通知するためのタイプ
  // ゲーム情報を進捗を通知するためのタイプ
  GAME_PROGRESS: 1,

  // プレイヤー情報を通知するためのタイプ
  PLAYER_INFO: 2,

  // 1000 番台はインゲーム内で使用するタイプ
  // プレイヤーの移動を通知するためのタイプ
  PLAYER_MOVE: 1000,

  // プレイヤーの爆弾を設置するためのタイプ
  PLAYER_BOMB: 1001,

  // TODO: アイテム
};

export const GAME_STATE = {
  WAITING: 1, // ゲーム開始前
  PLAYING: 2, // ゲーム中
  FINISHED: 3, // ゲーム終了
} as const;

export type GAME_STATE_TYPE = typeof GAME_STATE[keyof typeof GAME_STATE];
