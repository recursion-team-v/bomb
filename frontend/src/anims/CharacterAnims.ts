import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';

export const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrameRate = 12;

  for (const character of Constants.CHARACTERS) {
    anims.create({
      key: `${character}_idle_left`,
      frames: anims.generateFrameNames(character, {
        start: 0,
        end: 1,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.4,
    });

    anims.create({
      key: `${character}_idle_right`,
      frames: anims.generateFrameNames(character, {
        start: 2,
        end: 3,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.4,
    });

    anims.create({
      key: `${character}_idle_down`,
      frames: anims.generateFrameNames(character, {
        start: 4,
        end: 5,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.4,
    });

    anims.create({
      key: `${character}_idle_up`,
      frames: anims.generateFrameNames(character, {
        start: 6,
        end: 7,
      }),
      repeat: -1,
      frameRate: animsFrameRate * 0.4,
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

    anims.create({
      key: `${character}_damage_left`,
      frames: anims.generateFrameNames(character, {
        start: 24,
        end: 26,
      }),
      frameRate: animsFrameRate,
    });

    anims.create({
      key: `${character}_damage_right`,
      frames: anims.generateFrameNames(character, {
        start: 27,
        end: 29,
      }),
      frameRate: animsFrameRate,
    });

    anims.create({
      key: `${character}_damage_down`,
      frames: anims.generateFrameNames(character, {
        start: 30,
        end: 32,
      }),
      frameRate: animsFrameRate,
    });

    anims.create({
      key: `${character}_damage_up`,
      frames: anims.generateFrameNames(character, {
        start: 33,
        end: 35,
      }),
      frameRate: animsFrameRate,
    });

    anims.create({
      key: `${character}_death_left`,
      frames: anims.generateFrameNames(character, {
        start: 36,
        end: 39,
      }),
      frameRate: animsFrameRate * 0.3,
    });

    anims.create({
      key: `${character}_death_right`,
      frames: anims.generateFrameNames(character, {
        start: 40,
        end: 43,
      }),
      frameRate: animsFrameRate * 0.3,
    });

    anims.create({
      key: `${character}_death_down`,
      frames: anims.generateFrameNames(character, {
        start: 44,
        end: 47,
      }),
      frameRate: animsFrameRate * 0.3,
    });

    anims.create({
      key: `${character}_death_up`,
      frames: anims.generateFrameNames(character, {
        start: 48,
        end: 51,
      }),
      frameRate: animsFrameRate * 0.3,
    });
  }
};
