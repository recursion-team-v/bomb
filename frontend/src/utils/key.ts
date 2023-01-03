import { Keyboard, NavKeys } from '../types/keyboard';
import isMobile from './mobile';
import * as Constants from '../../../backend/src/constants/constants';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import Button from 'phaser3-rex-plugins/plugins/button.js';

import Game from '../scenes/Game';

export default function initializeKeys(game: Game): NavKeys {
  const kb = game.input.keyboard;

  let keys = {
    ...kb.createCursorKeys(),
    ...(kb.addKeys('W,S,A,D,SPACE') as Keyboard),
  };

  // モバイルの場合は仮想ジョイスティックを表示する
  if (isMobile()) {
    const joyStick = new VirtualJoystick(game, {
      x: Constants.JOYSTICK_X,
      y: Constants.JOYSTICK_Y,
      base: game.add.image(0, 0, Constants.JOYSTICK_BASE_KEY).setScale(1.5),
      thumb: game.add.image(0, 0, Constants.JOYSTICK_STICK_KEY).setScale(1.5),
      dir: '8dir', // 全方向
    });

    const button = new Button(
      game.add
        .circle(
          Constants.BUTTON_X,
          Constants.BUTTON_Y,
          Constants.BUTTON_RADIUS,
          Constants.BUTTON_COLOR_CODE
        )
        .setStrokeStyle(20, Constants.BUTTON_STROKE_COLOR_CODE)
        .setAlpha(0.8)
    );

    // 爆弾を設置する
    button.on('click', () => {
      game.getCurrentPlayer().placeBomb();
    });

    keys = {
      ...keys,
      ...joyStick.createCursorKeys(),
    };
  }
  return keys;
}
