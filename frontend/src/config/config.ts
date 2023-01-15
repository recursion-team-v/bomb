// debug
export const IS_DEBUG = !import.meta.env.PROD;

// 接続先のサーバーのURL
export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/*
ゲームの設定
*/

export const IS_SHOW_BLAST_POINT = true; // 爆風の範囲を事前に表示するかどうか

/*
debug 用
*/

// サーバーの爆発を表示するかどうか
export const DEBUG_IS_SHOW_SERVER_BLAST = IS_DEBUG;
// サーバーの爆弾を表示するかどうか
export const DEBUG_IS_SHOW_SERVER_BOMB = IS_DEBUG;

/*
asset 用
*/

export const ASSET_KEY_VOLUME_ON = 'volume_on';
export const ASSET_KEY_VOLUME_OFF = 'volume_off';

/*
シーンの名前
*/

export const SCENE_NAME_TITLE = 'title';
export const SCENE_NAME_PRELOADER = 'preloader';
export const SCENE_NAME_GAME = 'game';
export const SCENE_NAME_GAME_HEADER = 'gameHeader';
export const SCENE_NAME_GAME_RESULT = 'gameResult';

/*
  アニメーション関連
*/

export const BOMB_SPRITE_FRAME_COUNT = 18; // 爆弾の画像の枚数

// 爆弾のアニメーションの key
export const BOMB_ANIMATION_KEY = 'bomb_count';

/*
サウンド関連
*/

// TODO 後で true にする
export const SOUND_DEFAULT_IS_PLAY = true; // サウンドを再生するかどうか
export const SOUND_VOLUME = 0.2;
