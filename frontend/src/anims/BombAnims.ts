import Phaser from 'phaser';
import IngameConfig from '../config/ingameConfig';

export const createBombAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrame = 18; // 画像の枚数

  anims.create({
    key: 'bomb_count',
    frames: anims.generateFrameNames('bomb', {
      end: animsFrame - 1,
    }),
    frameRate: animsFrame / (IngameConfig.bombExplodedTime / 1000), // 秒間に表示する画像の枚数
  });
};
