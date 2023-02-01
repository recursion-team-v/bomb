import Phaser from 'phaser';
import ButtonPlugin from 'phaser3-rex-plugins/plugins/button-plugin.js';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import * as Constants from '../../backend/src/constants/constants';
import * as Config from './config/config';
import Lobby from './scenes/Lobby';
import Game from './scenes/Game';
import GameHeader from './scenes/GameHeader';
import GameResult from './scenes/GameResult';
import Preloader from './scenes/Preloader';
import isMobile from './utils/mobile';
import Title from './scenes/Title';

const screenHeight = () => (isMobile() ? Constants.MOBILE_HEIGHT : Constants.DEFAULT_HEIGHT);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  pixelArt: true,
  backgroundColor: Constants.PAGE_COLOR,
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    width: Constants.DEFAULT_WIDTH,
    height: screenHeight(),
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 },
      debug: Config.IS_DEBUG,
    },
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  autoFocus: true,
  scene: [Preloader, Title, Lobby, Game, GameHeader, GameResult],
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
  dom: {
    createContainer: true,
  },
};

const phaserGame = new Phaser.Game(config);
phaserGame.sound.mute = !Config.SOUND_DEFAULT_IS_PLAY;

interface WindowInterface {
  game: Phaser.Game;
}

declare const window: WindowInterface;
window.game = phaserGame;
export function phaserGlobalGameObject(): Phaser.Game {
  return window.game;
}

export default phaserGame;
