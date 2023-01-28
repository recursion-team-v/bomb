import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';

export const createMapAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrameRate = 8;
  for (const animKey of Object.values(Constants.GROUND_TYPES)) {
    anims.create({
      key: animKey,
      frames: anims.generateFrameNames(`ground_${animKey}`, {
        start: 0,
        end: 3,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.4,
    });
  }
};
