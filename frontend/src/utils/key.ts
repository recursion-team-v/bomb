import { Keyboard, NavKeys } from '../types/keyboard';
import isMobile from './mobile';
import * as Constants from '../../../backend/src/constants/constants';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import Game from '../scenes/Game';

export default function initializeKeys(game: Game): NavKeys {
  const kp = game.input.keyboard;

  let keys = {
    ...kp.createCursorKeys(),
    ...(kp.addKeys('W,S,A,D,SPACE') as Keyboard),
  };

  if (isMobile()) {
    const joyStick = new VirtualJoystick(game, {
      x: Constants.JOYSTICK_X,
      y: Constants.JOYSTICK_Y,
      radius: Constants.JOYSTICK_RADIUS,
      base: game.add.image(0, 0, Constants.JOYSTICK_BASE_KEY).setScale(1.5),
      thumb: game.add.image(0, 0, Constants.JOYSTICK_STICK_KEY).setScale(1.5),
      dir: '8dir', // 全方向
    });

    keys = {
      ...keys,
      ...joyStick.createCursorKeys(),
    };
  }
  return keys;
}
