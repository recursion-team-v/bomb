import { phaserGlobalGameObject } from '../PhaserGame';
import Game from '../scenes/Game';
import * as Config from '../config/config';

export function getGameScene(): Game {
  return getScene(Config.SCENE_NAME_GAME) as Game;
}

// scene 名から scene オブジェクトを取得する
export function getScene(sceneName: string): Phaser.Scene {
  return phaserGlobalGameObject().scene.getScene(sceneName);
}
