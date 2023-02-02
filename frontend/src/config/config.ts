// debug
export const IS_FRONTEND_DEBUG = !import.meta.env.PROD;

// 接続先のサーバーのURL
export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/*
ゲームの設定
*/

export const TIME_SYNC_INTERVAL = 10000; // timesync のインターバル(ms)
export const IS_SHOW_BLAST_POINT = true; // 爆風の範囲を事前に表示するかどうか

/*
debug 用
*/

// サーバーの爆発を表示するかどうか
export const DEBUG_IS_SHOW_SERVER_BLAST = IS_FRONTEND_DEBUG;
// サーバーの爆弾を表示するかどうか
export const DEBUG_IS_SHOW_SERVER_BOMB = IS_FRONTEND_DEBUG;

/*
asset 用
*/

export const ASSET_KEY_TITLE_BACKGROUND = 'title_background';
export const ASSET_KEY_PLAYER = 'player';
export const ASSET_KEY_VOLUME_ON = 'volume_on';
export const ASSET_KEY_VOLUME_OFF = 'volume_off';
export const ASSET_KEY_WINNER = 'winner';
export const ASSET_KEY_DRAW_GAME = 'draw_game';
export const ASSET_KEY_BATTLE_START_UP = 'battle_start_up';
export const ASSET_KEY_BATTLE_START_DOWN = 'battle_start_down';
export const ASSET_KEY_CURTAIN_OPEN = 'curtain_open';
export const ASSET_KEY_TROPHY = 'trophy';

/*
シーンの名前
*/

export const SCENE_NAME_TITLE = 'title';
export const SCENE_NAME_PRELOADER = 'preloader';
export const SCENE_NAME_LOBBY = 'lobby';
export const SCENE_NAME_GAME = 'game';
export const SCENE_NAME_GAME_HEADER = 'gameHeader';
export const SCENE_NAME_GAME_RESULT = 'gameResult';

/*
  アニメーション関連
*/

export const BOMB_SPRITE_FRAME_COUNT = 18; // 爆弾の画像の枚数

// アニメーションの key
export const TITLE_BACKGROUND_ANIMATION_KEY = 'title_background_animation';
export const BOMB_ANIMATION_KEY = 'bomb_count';
export const PENETRATION_BOMB_ANIMATION_KEY = 'penetration_bomb_count';
export const CURTAIN_OPEN_ANIMATION_KEY = 'curtain_open_animation';
export const TROPHY_ANIMATION_KEY = 'trophy_animation';

/*
サウンド関連
*/

// TODO 後で true にする
export const SOUND_DEFAULT_IS_PLAY = !IS_FRONTEND_DEBUG; // サウンドを再生するかどうか
export const SOUND_VOLUME = 0.2;

// 雲関連
export const ENABLE_CLOUD = true; // 雲を表示するかどうか
export const CLOUD_FREQUENCY = 500; // 雲を表示する頻度 数字を大きくすると頻度が下がる
export const CLOUD_SCALE_MIN = 3; // 雲の最小サイズ
export const CLOUD_SCALE_MAX = 5; // 雲の最大サイズ
