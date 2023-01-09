import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';

export const createBombAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: Config.BOMB_ANIMATION_KEY,
    frames: anims.generateFrameNames('bomb', {
      end: Config.BOMB_SPRITE_FRAME_COUNT - 1,
    }),
    frameRate: Config.BOMB_SPRITE_FRAME_COUNT / (Constants.BOMB_EXPLOSION_TIME / 1000), // 秒間に表示する画像の枚数
  });
};
