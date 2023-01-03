import Phaser from 'phaser';

import * as Constants from '../../backend/src/constants/constants';
import Game from './scenes/Game';
import GameHeader from './scenes/GameHeader';
import GameResult from './scenes/GameResult';
import Preloader from './scenes/Preloader';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import ButtonPlugin from 'phaser3-rex-plugins/plugins/button-plugin.js';

import isMobile from './utils/mobile';

const screenHeight = () => (isMobile() ? Constants.MOBILE_HEIGHT : Constants.HEIGHT);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    width: Constants.WIDTH,
    height: screenHeight(),
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  autoFocus: true,
  scene: [Preloader, Game, GameHeader, GameResult],
  plugins: {
    global: [
      {
        key: 'rexVirtualJoystick',
        plugin: VirtualJoystick,
        start: false,
      },
      {
        key: 'rexButton',
        plugin: ButtonPlugin,
        start: false,
      },
    ],
  },
};

const phaserGame = new Phaser.Game(config);

(window as any).game = phaserGame;

export default phaserGame;
