import Phaser from 'phaser';

import * as Constants from '../../backend/src/constants/constants';
import Game from './scenes/Game';
import Lobby from './scenes/Lobby';
import GameHeader from './scenes/GameHeader';
import GameResult from './scenes/GameResult';
import Preloader from './scenes/Preloader';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import ButtonPlugin from 'phaser3-rex-plugins/plugins/button-plugin.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import isMobile from './utils/mobile';

const screenHeight = () => (isMobile() ? Constants.MOBILE_HEIGHT : Constants.HEIGHT);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  // backgroundColor: '#18181b',
  plugins: {
    scene: [
      {
        key: 'rexUI',
        plugin: RexUIPlugin,
        mapping: 'rexUI',
      },
    ],
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
      debug: true,
    },
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  autoFocus: true,
  scene: [Preloader, Lobby, GameHeader, Game, GameResult],
};

const phaserGame = new Phaser.Game(config);

(window as any).game = phaserGame;

export default phaserGame;
