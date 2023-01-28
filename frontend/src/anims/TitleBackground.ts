import Phaser from 'phaser';
import * as Config from '../config/config';

export const createTitleBackgroundAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: Config.TITLE_BACKGROUND_ANIMATION_KEY,
    frames: anims.generateFrameNames('title_background', {
      start: 0,
      end: 15,
    }),
    frameRate: 10, // 秒間に表示する画像の枚数
    repeat: -1,
  });
};
