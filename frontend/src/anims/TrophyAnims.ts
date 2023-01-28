import Phaser from 'phaser';
import * as Config from '../config/config';

export const createTrophyAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: Config.TROPHY_ANIMATION_KEY,
    frames: anims.generateFrameNames('trophy', {
      start: 0,
      end: 19,
    }),
    frameRate: 10, // 秒間に表示する画像の枚数
    repeat: -1,
  });
};
