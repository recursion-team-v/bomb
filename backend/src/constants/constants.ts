/*
色の定義
*/

export const BLACK = 0x000000;
export const WHITE = 0xffffff;
export const GRAY = 0x808080;
export const BLUE = 0x0000ff;

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
export const INITIAL_SETTABLE_BOMB_COUNT = 1;

// 最大に設置できる爆弾の数
export const MAX_SETTABLE_BOMB_COUNT = 8;

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

/*
ボムの定義
*/

// 爆弾の爆発までの時間(ms)
export const BOMB_EXPLOSION_TIME = 2330;

// 爆弾の衝突判定の割合
export const BOMB_COLLISION_RATIO = 0.6;

// 爆弾が誘爆する時の遅延時間(ms)
export const BOMB_DETONATION_DELAY = 50;

// 爆風が維持される時間(ms)
// この時間だけ当たり判定が残る
export const BLAST_AVAILABLE_TIME = 500;

// クライアントとサーバで許容するプレイヤーの位置のズレ(px)
export const PLAYER_TOLERANCE_DISTANCE = 100;

// ゲームの制限時間
export const TIME_LIMIT_SEC = 181; // (+1秒するといい感じに表示される)

/*
アイテムの定義
*/
export const ITEM_TYPE = {
  BOMB_STRENGTH: 0, // ボムの威力アップ
  BOMB_POSSESSION_UP: 1, // ボムの所持数アップ
  PLAYER_SPEED: 2, // プレイヤーの移動速度アップ
} as const;

export type ITEM_TYPES = typeof ITEM_TYPE[keyof typeof ITEM_TYPE];

/*
衝突判定のカテゴリ
*/

export const COLLISION_CATEGORY = {
  DEFAULT: 0x0001, // デフォルト
  PLAYER: 0x0002, // プレイヤー
};

/*
マップの定義
*/

export const DEFAULT_TIP_SIZE = 64; // デフォルトのチップサイズ

// マップの設定
export const TILE_ROWS = 13; // タイルの行数
export const TILE_COLS = 15; // タイルの列数
export const TILE_WIDTH = DEFAULT_TIP_SIZE; // タイルの横幅
export const TILE_HEIGHT = DEFAULT_TIP_SIZE; // タイルの縦幅
export const MAX_BLOCKS = 50;
export const MIN_BLOCKS = 40;

// マップのタイルシートの idx
export const TILE_GROUND = {
  DEFAULT_IDX: [3, 4, 5], // 地面タイルの idx (3, 4, 5)
  SPAWN_IDX: [0, 1, 2], // 地面（スポーン）タイルの idx (0, 1, 2)
};
export const TILE_WALL = {
  OUTER_TOP_BOT: [19],
  OUTER_LEFT_RIGHT: [10],
  OUTER_CORNER: [21, 22, 23],
  INNER: [12, 13, 14, 19, 24, 25, 27],
  INNER_CHAMFER: 25, // 内壁タイルの chamfer
};
export const TILE_BLOCK_IDX = 1; // 破壊できる箱の idx

export const PLAYER_WIDTH = DEFAULT_TIP_SIZE; // プレイヤーの横幅
export const PLAYER_HEIGHT = DEFAULT_TIP_SIZE; // プレイヤーの縦幅

/*
画面の定義
*/
export const HEADER_HEIGHT = 64; // ヘッダーの高さ
export const HEIGHT = TILE_HEIGHT * TILE_ROWS + HEADER_HEIGHT; // 画面の高さ
export const MOBILE_HEIGHT = HEIGHT + 300; // モバイル用の余白
export const WIDTH = TILE_WIDTH * TILE_COLS; // 画面の幅
export const HEADER_COLOR_CODE = BLACK; // ヘッダーの色
export const HEADER_TIMER_TEXT_COLOR_CODE = WHITE; // ヘッダーのタイマーの文字色
export const HEADER_WIDTH = WIDTH; // ヘッダーの高さ

/*
ラベルの定義
*/

export const LABEL_PLAYER = 'PLAYER';
export const LABEL_BOMB = 'BOMB';

/*
モバイル用の操作アイコンの定義
*/

export const JOYSTICK_X = 200; // ジョイスティックの x 座標
export const JOYSTICK_Y = HEIGHT + 150; // ジョイスティックの y 座標
export const JOYSTICK_BASE_KEY = 'joystick-base'; // ジョイスティックのベースのキー
export const JOYSTICK_STICK_KEY = 'joystick-stick'; // ジョイスティックのスティックのキー

export const BUTTON_X = WIDTH - 200; // ボタンの x 座標
export const BUTTON_Y = JOYSTICK_Y; // ボタンの y 座標
export const BUTTON_RADIUS = 100; // ボタンの半径
export const BUTTON_COLOR_CODE = BLUE; // ボタンの色
export const BUTTON_STROKE_COLOR_CODE = GRAY; // ボタンの枠線の色
