import Phaser from 'phaser';

export const createExplodeAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrameRate = 15;

  anims.create({
    key: 'center_explode',
    frames: anims.generateFrameNames('explosion', {
      start: 0,
      end: 6,
    }),
    repeat: undefined,
    frameRate: animsFrameRate * 0.4,
  });
  anims.create({
    key: 'xy_explode',
    frames: anims.generateFrameNames('explosion', {
      start: 7,
      end: 12,
    }),
    repeat: undefined,
    frameRate: animsFrameRate * 0.4,
  });
  anims.create({
    key: 'tip_explode',
    frames: anims.generateFrameNames('tip_explosion', {
      start: 0,
      end: 6,
    }),
    repeat: undefined,
    frameRate: animsFrameRate * 0.4,
  });
};
