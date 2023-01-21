import { phaserGlobalGameObject } from '../PhaserGame';

export function isMute(): boolean {
  return phaserGlobalGameObject().sound.mute;
}

export function isPlay(): boolean {
  return !phaserGlobalGameObject().sound.mute;
}

// on / off を切り替える
export function toggle() {
  phaserGlobalGameObject().sound.mute = !isMute();
}
