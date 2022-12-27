import Phaser from 'phaser';

export const createExplodeAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrameRate = 7; // each bomb animation has 7 frames

  anims.create({
    key: 'bomb_center_explosion',
    frames: anims.generateFrameNames('bomb_center_explosion', {
      start: 0,
      end: 6,
    }),
    frameRate: animsFrameRate,
  });

  anims.create({
    key: 'bomb_horizontal_explosion',
    frames: anims.generateFrameNames('bomb_horizontal_explosion', {
      start: 0,
      end: 6,
    }),
    frameRate: animsFrameRate,
  });

  anims.create({
    key: 'bomb_horizontal_end_explosion',
    frames: anims.generateFrameNames('bomb_horizontal_end_explosion', {
      start: 0,
      end: 6,
    }),
    frameRate: animsFrameRate,
  });
};
