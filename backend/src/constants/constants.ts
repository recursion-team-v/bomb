export const FPS = 60; // 1 秒間のフレーム数
export const FRAME_RATE = 1000 / FPS; // 1 frame にかかる時間(ms)

// Dockerfile の中と、デプロイ時にポートを指定しているので、ここの設定は開発時にしか利用されません。
export const SERVER_LISTEN_PORT = 2567;
// ゲームルーム参加時に使用するキー
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

// ルームの最大人数
export const MAX_PLAYER = 4;

// 初期に設置できる爆弾の数
export const INITIAL_SET_BOMB_NUM = 1;

// 初期の爆弾の破壊力
export const INITIAL_BOMB_STRENGTH = 1;

// プレイヤーの初期移動速度
export const INITIAL_PLAYER_SPEED = 4;

// プレイヤーの初期位置
// TODO: サイズから計算する
export const INITIAL_PLAYER_POSITION = [
  { x: 96, y: 156 },
  { x: 864, y: 156 },
  { x: 96, y: 796 },
  { x: 864, y: 796 },
  { x: 480, y: 476 },
];

// 爆弾の爆発までの時間(ms)
export const BOMB_EXPLOSION_TIME = 2330;

// クライアントとサーバで許容するプレイヤーの位置のズレ(px)
export const PLAYER_TOLERANCE_DISTANCE = 10;

/*
マップの定義
*/

export const DEFAULT_TIP_SIZE = 64; // デフォルトのチップサイズ

// マップの設定
export const TILE_ROWS = 13; // タイルの行数
export const TILE_COLS = 15; // タイルの列数
export const TILE_WIDTH = DEFAULT_TIP_SIZE; // タイルの横幅
export const TILE_HEIGHT = DEFAULT_TIP_SIZE; // タイルの縦幅

// マップのタイルシートの idx
export const TILE_GROUND = {
  DEFAULT_IDX: [3, 4, 5], // 地面タイルの idx (3, 4, 5)
  SPAWN_IDX: [0, 1, 2], // 地面（スポーン）タイルの idx (0, 1, 2)
};
export const TILE_WALL = {
  DEFAULT_1_IDX: 10, // 外壁タイル1の idx
  DEFAULT_2_IDX: 19, // 外壁タイル2の idx
  DEFAULT_CORNER_IDX: 21, // 外壁タイル（角）の idx
};
export const TILE_CRATE_IDX = 1; // 破壊できる箱の idx

export const PLAYER_WIDTH = DEFAULT_TIP_SIZE; // プレイヤーの横幅
export const PLAYER_HEIGHT = DEFAULT_TIP_SIZE; // プレイヤーの縦幅

/*
画面の定義
*/
export const HEIGHT = TILE_HEIGHT * TILE_ROWS; // 画面の高さ
export const WIDTH = TILE_WIDTH * TILE_COLS; // 画面の幅
export const HEADER_COLOR_CODE = '#000000'; // ヘッダーの色
export const HEADER_TIMER_TEXT_COLOR_CODE = '#FFFFFF'; // ヘッダーのタイマーの文字色
export const HEADER_HEIGHT = 64; // ヘッダーの高さ
export const HEADER_WIDTH = WIDTH; // ヘッダーの高さ
