import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';

export const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrameRate = 12;

  for (const character of Object.values(Constants.CHARACTERS)) {
    anims.create({
      key: `${character}_idle_left`,
      frames: anims.generateFrameNames(character, {
        start: 0,
        end: 1,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.6,
    });

    anims.create({
      key: `${character}_idle_right`,
      frames: anims.generateFrameNames(character, {
        start: 2,
        end: 3,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.6,
    });

    anims.create({
      key: `${character}_idle_down`,
      frames: anims.generateFrameNames(character, {
        start: 4,
        end: 5,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.6,
    });

    anims.create({
      key: `${character}_idle_up`,
      frames: anims.generateFrameNames(character, {
        start: 6,
        end: 7,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.6,
    });

    anims.create({
      key: `${character}_left`,
      frames: anims.generateFrameNames(character, {
        start: 8,
        end: 11,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.6,
    });

    anims.create({
      key: `${character}_right`,
      frames: anims.generateFrameNames(character, {
        start: 12,
        end: 15,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.6,
    });

    anims.create({
      key: `${character}_down`,
      frames: anims.generateFrameNames(character, {
        start: 16,
        end: 19,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.6,
    });

    anims.create({
      key: `${character}_up`,
      frames: anims.generateFrameNames(character, {
        start: 20,
        end: 23,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.6,
    });
  }
};
