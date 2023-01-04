import Phaser from 'phaser';

export const createExplodeAnims = (anims: Phaser.Animations.AnimationManager) => {
  // 爆発アニメーションのフレームレート
  // 0.5ms(BLAST_AVAILABLE_TIME) で全ての画像を表示したいので、
  // 7枚を 0.5ms で表示するために、フレームレートは倍(1sec/0.5ms)の 14 に設定する
  const animsFrameRate = 14;

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
