import Phaser from 'phaser';
import * as Config from '../config/config';

export const createCurtainOpenAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: Config.CURTAIN_OPEN_ANIMATION_KEY,
    frames: anims.generateFrameNames('curtain_open', {
      start: 0,
      end: 9,
    }),
    frameRate: 10, // 秒間に表示する画像の枚数
    repeat: 0,
  });
};
