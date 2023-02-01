/*
色の定義
*/

export const DEBUG_ADMIN_PASSWORD = 'admin';

export const PAGE_COLOR = 0x18181b;
export const BLACK = 0x000000;
export const WHITE = 0xffffff;
export const DARK_GRAY = 0x374151;
export const GRAY = 0x6b7280;
export const LIGHT_GRAY = 0xcbd5e1;
export const BLUE = 0x0000ff;
export const RED = 0xff0000;
export const GREEN = 0xa3e635;
export const LIGHT_RED = 0xf87171;

export const FPS = 60; // 1 秒間のフレーム数
export const FRAME_RATE = 1000 / FPS; // 1 frame にかかる時間(ms)

// オブジェクト生成時の遅延時間
// クライアントとサーバの同期を取るために、オブジェクト生成時に遅延を入れています。
export const OBJECT_CREATION_DELAY = 100; // ms
// オブジェクト削除時の遅延時間
export const OBJECT_REMOVAL_DELAY = 100; // ms

// ゲームの状態をチェックする間隔
// ゲームの状態をチェックする間隔を短くすると、ゲームの状態が変化したときにすぐに反映されます。
// 500 ms にすることで、この期間の間に複数のプレイヤーが死んだときは、引き分けになるようにしています。
export const CHECK_GAME_RESULT_INTERVAL = 500; // ms

// Dockerfile の中と、デプロイ時にポートを指定しているので、ここの設定は開発時にしか利用されません。
export const SERVER_LISTEN_PORT = 2567;
// ゲームルーム参加時に使用するキー
export const GAME_PUBLIC_ROOM_KEY = 'game';
export const GAME_CUSTOM_ROOM_KEY = 'custom';
// ロビールーム参加時に使用するキー
export const GAME_LOBBY_KEY = 'lobby';

export const NOTIFICATION_TYPE = {
  // 1 番台はゲーム情報を通知するためのタイプ
  // ゲーム情報を進捗を通知するためのタイプ
  GAME_PROGRESS: 1,

  // プレイヤー情報を通知するためのタイプ
  PLAYER_INFO: 2,

  // プレイヤーのゲーム状態を通知するためのタイプ
  PLAYER_GAME_STATE: 3,

  // プレイヤーの準備完了を通知するためのタイプ
  PLAYER_IS_READY: 4,

  // プレイヤーのデータ読み込み完了を通知するためのタイプ
  PLAYER_IS_LOADING_COMPLETE: 5,

  // ゲームデータを通知するためのタイプ
  GAME_DATA: 6,

  // ゲームの開始に関する情報を通知するためのタイプ
  GAME_START_INFO: 10,

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

export const GAME_RESULT = {
  NONE: 0,
  WIN: 1,
  DRAW: 2,
};

export type GAME_RESULT_TYPE = typeof GAME_RESULT[keyof typeof GAME_RESULT];

export const PLAYER_GAME_STATE = {
  WAITING: 1, // ゲーム開始前
  READY: 2, // ゲーム準備完了
  LOADING_COMPLETE: 3, // ゲームのデータ読み込みが完了
  PLAYING: 4, // ゲーム中
  FINISHED: 5, // ゲーム終了
};

export type PLAYER_GAME_STATE_TYPE = typeof PLAYER_GAME_STATE[keyof typeof PLAYER_GAME_STATE];

// インゲーム内で発生する、壁が落下するイベントが発生する時間(ms)
// 残り時間がこの時間になったら、イベントが発生する
export const INGAME_EVENT_DROP_WALLS_TIME = 30000; // 30 秒

export const DIRECTION = {
  UP: 1,
  DOWN: 2,
  RIGHT: 3,
  LEFT: 4,
} as const;

export type DIRECTION_TYPE = typeof DIRECTION[keyof typeof DIRECTION];

// ルームの最大人数
export const MAX_PLAYER = 4;

// デバッグ: デフォルトの敵の数
export const DEBUG_DEFAULT_ENEMY_COUNT = 2;

/*
マップの定義
*/

export const DEFAULT_TIP_SIZE = 64; // デフォルトのチップサイズ

// マップの設定
export const DEFAULT_TILE_ROWS = 13; // タイルの行数
export const DEFAULT_TILE_COLS = 15; // タイルの列数
export const TILE_WIDTH = DEFAULT_TIP_SIZE; // タイルの横幅
export const TILE_HEIGHT = DEFAULT_TIP_SIZE; // タイルの縦幅
export const MAX_BLOCKS = 100;

export const GROUND_TYPES = {
  top: 'top',
  left: 'left',
  right: 'right',
  bottom: 'bottom',
  top_left: 'top_left',
  top_right: 'top_right',
  bottom_left: 'bottom_left',
  bottom_right: 'bottom_right',
};

export const MAP_ASSETS = {
  grass_1: 'grass_1',
  grass_2: 'grass_2',
  rock_1: 'rock_1',
  rock_2: 'rock_2',
  plants: 'plants',
};

export const TILE_WALL = {
  INNER_CHAMFER: 30, // 内壁タイルの chamfer
};
export const TILE_BLOCK_IDX = 1; // 破壊できる箱の idx

export const PLAYER_WIDTH = DEFAULT_TIP_SIZE; // プレイヤーの横幅
export const PLAYER_HEIGHT = DEFAULT_TIP_SIZE; // プレイヤーの縦幅

// character スプライト key
export const CHARACTERS = ['cat', 'wolf', 'bunny', 'pig'];

/*
敵の定義
*/

// 敵のAIの評価を切り替えるタイミング
export const ENEMY_EVALUATION_STEP = {
  BEGINNING: 'BEGINNING',
  MIDDLE: 'MIDDLE',
  END: 'END',
};

export type ENEMY_EVALUATION_STEPS =
  typeof ENEMY_EVALUATION_STEP[keyof typeof ENEMY_EVALUATION_STEP];

// 敵AI が使用する影響度マップの評価値(合計値が 1 になるようにする)
export const ENEMY_EVALUATION_RATIO_PER_STEP = {
  // 序盤
  [ENEMY_EVALUATION_STEP.BEGINNING]: {
    // すぐに移動できるかの評価値
    ENEMY_EVALUATION_RATIO_NEAREST: 0.1,
    // アイテムの評価値
    ENEMY_EVALUATION_RATIO_ITEM: 0.3,
    // ボムと将来発生する爆風の評価値
    ENEMY_EVALUATION_RATIO_BOMB: 0.3,
    // ボムを設置するのに適した場所の評価値
    ENEMY_EVALUATION_RATIO_GOOD_BOMB_PLACE: 0.2,
    // 他のプレイヤーとの距離
    ENEMY_EVALUATION_RATIO_FAR_FROM_OTHER_PLAYER: 0.1,
  },
  // 中盤
  [ENEMY_EVALUATION_STEP.MIDDLE]: {
    // 他のプレイヤーとの距離
    ENEMY_EVALUATION_RATIO_FAR_FROM_OTHER_PLAYER: 0.2,
    // すぐに移動できるかの評価値
    ENEMY_EVALUATION_RATIO_NEAREST: 0.1,
    // アイテムの評価値
    ENEMY_EVALUATION_RATIO_ITEM: 0.2,
    // ボムと将来発生する爆風の評価値
    ENEMY_EVALUATION_RATIO_BOMB: 0.4,
    // ボムを設置するのに適した場所の評価値
    ENEMY_EVALUATION_RATIO_GOOD_BOMB_PLACE: 0.1,
  },
  // 終盤
  [ENEMY_EVALUATION_STEP.END]: {
    // 他のプレイヤーとの距離
    ENEMY_EVALUATION_RATIO_FAR_FROM_OTHER_PLAYER: 0.2,
    // ボムと将来発生する爆風の評価値
    ENEMY_EVALUATION_RATIO_BOMB: 0.8,
  },
};

// 敵AI が使用する影響度マップの評価値のラベル
export const ENEMY_EVALUATION_RATIO_LABEL = {
  // ENEMY_EVALUATION_RATIO_FREE_SPACE: 'ENEMY_EVALUATION_RATIO_FREE_SPACE', // どれぐらい自由に移動できるかの評価値
  ENEMY_EVALUATION_RATIO_FAR_FROM_OTHER_PLAYER: 'ENEMY_EVALUATION_RATIO_FAR_FROM_OTHER_PLAYER', // 他のプレイヤーからどれぐらい離れているかの評価値
  ENEMY_EVALUATION_RATIO_NEAREST: 'ENEMY_EVALUATION_RATIO_NEAREST', // 現在地からの距離の評価値
  ENEMY_EVALUATION_RATIO_ITEM: 'ENEMY_EVALUATION_RATIO_ITEM', // アイテムの評価値
  ENEMY_EVALUATION_RATIO_BOMB: 'ENEMY_EVALUATION_RATIO_BOMB', // ボムと将来発生する爆風の評価値
  ENEMY_EVALUATION_RATIO_GOOD_BOMB_PLACE: 'ENEMY_EVALUATION_RATIO_GOOD_BOMB_PLACE', // ボムを置くのに適した場所の評価値
} as const;

export type ENEMY_EVALUATION_RATIO_LABELS =
  typeof ENEMY_EVALUATION_RATIO_LABEL[keyof typeof ENEMY_EVALUATION_RATIO_LABEL];

/*
画面の定義
*/
export const HEADER_HEIGHT = 64; // ヘッダーの高さ
export const DEFAULT_HEIGHT = TILE_HEIGHT * DEFAULT_TILE_ROWS + HEADER_HEIGHT; // 画面の高さ
export const MOBILE_HEIGHT = DEFAULT_HEIGHT + 300; // モバイル用の余白
export const DEFAULT_WIDTH = TILE_WIDTH * DEFAULT_TILE_COLS; // 画面の幅
export const HEADER_COLOR_CODE = BLACK; // ヘッダーの色
export const HEADER_TIMER_TEXT_COLOR_CODE = WHITE; // ヘッダーのタイマーの文字色
export const DEFAULT_HEADER_WIDTH = DEFAULT_WIDTH; // ヘッダーの高さ

/*
プレイヤーの状態の定義
*/

// デフォルトのプレイヤーの名前
export const DEFAULT_PLAYER_NAME = 'noname';

// プレイヤーの初期HP
export const INITIAL_PLAYER_HP = 1;

// プレイヤーの最大HP
export const MAX_PLAYER_HP = 3;

// 初期に設置できる爆弾の数
export const INITIAL_SETTABLE_BOMB_COUNT = 1;

// 最大に設置できる爆弾の数
export const MAX_SETTABLE_BOMB_COUNT = 8;

// 初期の爆弾の破壊力
export const INITIAL_BOMB_STRENGTH = 2;

// 最大の爆弾の破壊力
export const MAX_BOMB_STRENGTH = 12;

// プレイヤーの初期移動速度
export const INITIAL_PLAYER_SPEED = 2.5;

// プレイヤーの最大移動速度
export const MAX_PLAYER_SPEED = 5;

// プレイヤーが被弾時に一定時間無敵になる時間(ms)
export const PLAYER_INVINCIBLE_TIME = 3000;

// プレイヤーの名前の最大文字数
export const MAX_USER_NAME_LENGTH = 10;

/*
ボムの定義
*/

export const BOMB_TYPE = {
  NORMAL: 1,
  PENETRATION: 2, // ブロックを貫通するボム
};

export type BOMB_TYPES = typeof BOMB_TYPE[keyof typeof BOMB_TYPE];

// 爆弾がプレイヤーに与えるダメージ
export const BOMB_DAMAGE = 1;

// 爆弾の爆発までの時間(ms)
export const BOMB_EXPLOSION_TIME = 2330;

// 爆弾が誘爆する時の遅延時間(ms)
export const BOMB_DETONATION_DELAY = 50;

// 爆風の衝突判定の割合
export const BLAST_COLLISION_RATIO_X = 0.4;
export const BLAST_COLLISION_RATIO_Y = 0.7;

// 爆風が維持される時間(ms)
// この時間だけ当たり判定が残る
export const BLAST_AVAILABLE_TIME = 500;

// クライアントとサーバで許容するプレイヤーの位置のズレ(px)
export const PLAYER_TOLERANCE_DISTANCE = 100;

// ゲームの制限時間
export const GAME_PREPARING_TIME = 4.5; // ゲーム開始演出の時間
export const TIME_LIMIT_SEC = 181 + GAME_PREPARING_TIME; // (+1秒するといい感じに表示される)

/*
アイテムの定義
*/

// アイテムが一致時間破壊されない時間
// ブロックを破壊した時にアイテムが出現するのだが、爆風が残ってるとアイテムが破壊されてしまうので一定時間無敵にする
export const ITEM_INVINCIBLE_TIME = 100; // ms

// プレイヤーが死んだ時に、そのプレイヤーのアイテムが落ちるまでの時間
export const ITEM_DROP_TIME_WHEN_PLAYER_DEAD = 2000; // ms

export const ITEM_TYPE = {
  NONE: 'NONE', // アイテムなし
  BOMB_STRENGTH: 'BOMB_STRENGTH', // ボムの威力アップ
  BOMB_POSSESSION_UP: 'BOMB_POSSESSION_UP', // ボムの所持数アップ
  HEART: 'HEART', // 残機アップ
  PENETRATION_BOMB: 'PENETRATION_BOMB', // ブロックを貫通するボム
  PLAYER_SPEED: 'PLAYER_SPEED', // プレイヤーの移動速度アップ
} as const;

export type ITEM_TYPES = typeof ITEM_TYPE[keyof typeof ITEM_TYPE];

// アイテムを取得した際の増加量
export const ITEM_INCREASE_RATE = {
  [ITEM_TYPE.BOMB_POSSESSION_UP]: 1,
  [ITEM_TYPE.BOMB_STRENGTH]: 1,
  [ITEM_TYPE.HEART]: 1,
  [ITEM_TYPE.PLAYER_SPEED]: 0.25,
};

/*
アイテムの初期配置数
*/

export const ITEM_PLACE_COUNT = {
  [ITEM_TYPE.NONE]: 0,
  [ITEM_TYPE.BOMB_POSSESSION_UP]: 12,
  [ITEM_TYPE.BOMB_STRENGTH]: 12,
  [ITEM_TYPE.HEART]: 3,
  [ITEM_TYPE.PENETRATION_BOMB]: 0,
  [ITEM_TYPE.PLAYER_SPEED]: 8,
};

/*
衝突判定のカテゴリ
*/

export const COLLISION_CATEGORY = {
  DEFAULT: 0x0001, // デフォルト
  PLAYER: 0x0002, // プレイヤー
};

/*
ラベルの定義
*/

export const OBJECT_LABEL = {
  BOMB: 'BOMB',
  BLAST: 'BLAST',
  BLOCK: 'BLOCK',
  DROP_WALL: 'DROP_WALL', // 落下してくる壁
  DROP_WALL_SHADOW: 'DROP_WALL_SHADOW', // 落下してくる壁の影
  ITEM: 'ITEM',
  PLAYER: 'PLAYER',
  WALL: 'WALL',
} as const;

export type OBJECT_LABELS = typeof OBJECT_LABEL[keyof typeof OBJECT_LABEL];

// 各オブジェクトと爆風の衝突判定
// 0: 爆風の邪魔をしないオブジェクト(床、プレイヤーなど)
// 1: 爆風の邪魔をするが、自身は削除されるオブジェクト(箱、アイテムなど)
// 2: 爆風の邪魔をするオブジェクト(壁、箱など)
export const OBJECT_COLLISION_TO_BLAST = {
  NONE: 0,
  [OBJECT_LABEL.BOMB]: 1,
  [OBJECT_LABEL.BLAST]: 0,
  [OBJECT_LABEL.BLOCK]: 1,
  [OBJECT_LABEL.ITEM]: 1,
  [OBJECT_LABEL.PLAYER]: 0,
  [OBJECT_LABEL.WALL]: 2,
  [OBJECT_LABEL.DROP_WALL_SHADOW]: 0,
  [OBJECT_LABEL.DROP_WALL]: 2,
} as const;

export type OBJECT_COLLISIONS_TO_BLAST =
  typeof OBJECT_COLLISION_TO_BLAST[keyof typeof OBJECT_COLLISION_TO_BLAST];

// 数字の大きいものが上にくる
export const OBJECT_DEPTH = {
  NONE: 0,
  [OBJECT_LABEL.ITEM]: 1, // ブロックの下にある
  [OBJECT_LABEL.BLAST]: 2, // ブロックや、アイテムの上にある
  [OBJECT_LABEL.BLOCK]: 3, // ブロックをすり抜けられるアイテムがある
  [OBJECT_LABEL.BOMB]: 4, // 特殊なアイテムで壁の上を爆弾が滑ることがある
  // reserved: 9 は敵キャラクターが使用しています
  [OBJECT_LABEL.PLAYER]: 10,
  [OBJECT_LABEL.WALL]: 99,
  [OBJECT_LABEL.DROP_WALL_SHADOW]: 100,
  [OBJECT_LABEL.DROP_WALL]: 101,
} as const;

export type OBJECT_DEPTH_TYPE = typeof OBJECT_DEPTH[keyof typeof OBJECT_DEPTH];

// プレイヤーが各オブジェクトの上を移動できるかどうか
// 2: 移動できる
// 1: 破壊すれば移動できる
// 0: 移動できない
export const OBJECT_IS_MOVABLE = {
  NONE: 2,
  [OBJECT_LABEL.BOMB]: 0,
  [OBJECT_LABEL.BLAST]: 0, // 移動できるが、爆風に当たると死ぬので、移動できないとみなす
  [OBJECT_LABEL.BLOCK]: 1,
  [OBJECT_LABEL.ITEM]: 2,
  [OBJECT_LABEL.PLAYER]: 2,
  [OBJECT_LABEL.WALL]: 0,
  [OBJECT_LABEL.DROP_WALL_SHADOW]: 0, // 移動できるがその後落ちてくる壁に当たると死ぬので、移動できないとみなす
  [OBJECT_LABEL.DROP_WALL]: 0,
} as const;

export type OBJECT_IS_MOVABLE_TYPES = typeof OBJECT_IS_MOVABLE[keyof typeof OBJECT_IS_MOVABLE];

/*
モバイル用の操作アイコンの定義
*/

export const JOYSTICK_X = 200; // ジョイスティックの x 座標
export const JOYSTICK_Y = DEFAULT_HEIGHT + 150; // ジョイスティックの y 座標
export const JOYSTICK_BASE_KEY = 'joystick-base'; // ジョイスティックのベースのキー
export const JOYSTICK_STICK_KEY = 'joystick-stick'; // ジョイスティックのスティックのキー

export const BUTTON_X = DEFAULT_WIDTH - 200; // ボタンの x 座標
export const BUTTON_Y = JOYSTICK_Y; // ボタンの y 座標
export const BUTTON_RADIUS = 100; // ボタンの半径
export const BUTTON_COLOR_CODE = BLUE; // ボタンの色
export const BUTTON_STROKE_COLOR_CODE = GRAY; // ボタンの枠線の色

/*
壁落下の関する定義
*/

export const DROP_WALL_DURATION = 200; // 壁が落下するまでの時間
