import Phaser from 'phaser';

export const createPlayerAnims = (anims: Phaser.Animations.AnimationManager, key: string) => {
  const animsFrameRate = 15;

  anims.create({
    key: 'player_up',
    frames: anims.generateFrameNames(key, {
      start: 0,
      end: 6,
    }),
    repeat: -1,
    frameRate: animsFrameRate * 0.6,
  });

  anims.create({
    key: 'player_right',
    frames: anims.generateFrameNames(key, {
      start: 7,
      end: 13,
    }),
    repeat: -1,
    frameRate: animsFrameRate * 0.6,
  });

  anims.create({
    key: 'player_down',
    frames: anims.generateFrameNames(key, {
      start: 14,
      end: 20,
    }),
    repeat: -1,
    frameRate: animsFrameRate * 0.6,
  });

  anims.create({
    key: 'player_left',
    frames: anims.generateFrameNames(key, {
      start: 21,
      end: 27,
    }),
    repeat: -1,
    frameRate: animsFrameRate * 0.6,
  });
};
