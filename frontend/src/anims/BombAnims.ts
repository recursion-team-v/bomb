import Phaser from 'phaser';

export const createBombAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrameRate = 10;

  anims.create({
    key: 'bomb_count',
    frames: anims.generateFrameNames('bomb', {
      end: 4,
    }),
    repeat: undefined,
    frameRate: animsFrameRate * 0.1,
  });
};
