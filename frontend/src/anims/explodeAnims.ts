import Phaser from 'phaser';

export const createExplodeAnims = (anims: Phaser.Animations.AnimationManager) => {
  // 爆発アニメーションのフレームレート
  // 0.5ms(BLAST_AVAILABLE_TIME) で全ての画像を表示したいので、
  // 7枚を 0.5ms で表示するために、フレームレートは倍(1sec/0.5ms)の 14 に設定する
  const animsFrameRate = 14;

  anims.create({
    key: 'bomb_center_blast',
    frames: anims.generateFrameNames('bomb_center_blast', {
      start: 0,
      end: 6,
    }),
    frameRate: animsFrameRate,
  });

  anims.create({
    key: 'bomb_horizontal_blast',
    frames: anims.generateFrameNames('bomb_horizontal_blast', {
      start: 0,
      end: 6,
    }),
    frameRate: animsFrameRate,
  });

  anims.create({
    key: 'bomb_horizontal_end_blast',
    frames: anims.generateFrameNames('bomb_horizontal_end_blast', {
      start: 0,
      end: 6,
    }),
    frameRate: animsFrameRate,
  });
};

export const createPenetrationExplodeAnims = (anims: Phaser.Animations.AnimationManager) => {
  // 爆発アニメーションのフレームレート
  // 0.5ms(BLAST_AVAILABLE_TIME) で全ての画像を表示したいので、
  // 7枚を 0.5ms で表示するために、フレームレートは倍(1sec/0.5ms)の 14 に設定する
  const animsFrameRate = 14;

  anims.create({
    key: 'penetration_bomb_center_blast',
    frames: anims.generateFrameNames('penetration_bomb_center_blast', {
      start: 0,
      end: 6,
    }),
    frameRate: animsFrameRate,
  });

  anims.create({
    key: 'penetration_bomb_horizontal_blast',
    frames: anims.generateFrameNames('penetration_bomb_horizontal_blast', {
      start: 0,
      end: 6,
    }),
    frameRate: animsFrameRate,
  });

  anims.create({
    key: 'penetration_bomb_horizontal_end_blast',
    frames: anims.generateFrameNames('penetration_bomb_horizontal_end_blast', {
      start: 0,
      end: 6,
    }),
    frameRate: animsFrameRate,
  });
};
