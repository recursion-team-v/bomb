import Phaser from 'phaser';

import ScreenConfig from './config/screenConfig';
import Game from './scenes/Game';
import GameHeader from './scenes/GameHeader';
import Preloader from './scenes/Preloader';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  backgroundColor: '#64748b',
  pixelArt: true,
  scale: {
    width: ScreenConfig.width,
    height: ScreenConfig.height,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  autoFocus: true,
  scene: [Preloader, Game, GameHeader],
};

const phaserGame = new Phaser.Game(config);

(window as any).game = phaserGame;

export default phaserGame;
