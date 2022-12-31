import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';

export const createBombAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrame = 18; // 画像の枚数

  anims.create({
    key: 'bomb_count',
    frames: anims.generateFrameNames('bomb', {
      end: animsFrame - 1,
    }),
    frameRate: animsFrame / (Constants.BOMB_EXPLOSION_TIME / 1000), // 秒間に表示する画像の枚数
  });
};
