// 接続先のサーバーのURL
export const serverUrl = 'wss://bomb-e47mei43gq-an.a.run.app:443';

/*
asset 用
*/

export const ASSET_KEY_VOLUME_ON = 'volume_on';
export const ASSET_KEY_VOLUME_OFF = 'volume_off';

/*
シーンの名前
*/

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
export const SOUND_DEFAULT_IS_PLAY = false; // サウンドを再生するかどうか
export const SOUND_VOLUME = 0.2;

/*
ローカルストレージ関連
*/

export const LOCAL_STORAGE_KEY_ROOM_ID = 'roomId';
export const LOCAL_STORAGE_KEY_SESSION_ID = 'sessionId';
