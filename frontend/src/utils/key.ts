import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';

import * as Constants from '../../../backend/src/constants/constants';
import Game from '../scenes/Game';
import { Keyboard, NavKeys } from '../types/keyboard';
import isMobile from './mobile';

let button: Phaser.GameObjects.Image;

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

    const container = game.add.container(Constants.BUTTON_X, Constants.BUTTON_Y);
    button = game.add.image(0, 0, 'bomb').setScale(2);
    button.setInteractive();
    button.on('pointerup', () => game.getCurrentPlayer().placeBomb());

    const circle1 = game.add.circle(0, 0, Constants.BUTTON_RADIUS, Constants.GRAY);
    const circle2 = game.add.circle(0, 0, Constants.BUTTON_RADIUS - 5, Constants.LIGHT_GRAY);
    container.add([circle1, circle2, button]);

    keys = {
      ...keys,
      ...joyStick.createCursorKeys(),
    };
  }
  return keys;
}

export function enableKeys(keys: NavKeys): void {
  Object.values(keys).forEach((key) => {
    key.enabled = true;
  });
  if (isMobile()) button.setInteractive();
}

export function disableKeys(keys: NavKeys): void {
  Object.values(keys).forEach((key) => {
    key.enabled = false;
  });
  if (isMobile()) button.disableInteractive();
}

export function customCursor(scene: Phaser.Scene) {
  scene.input.setDefaultCursor('url(assets/icons/cursor.png), pointer');
}
