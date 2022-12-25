import Phaser from 'phaser';

import ScreenConfig from './config/config';
import Game from './scenes/Game';
import GameHeader from './scenes/GameHeader';
import GameResult from './scenes/GameResult';
import Preloader from './scenes/Preloader';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
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
  scene: [Preloader, Game, GameHeader, GameResult],
};

const phaserGame = new Phaser.Game(config);

(window as any).game = phaserGame;

export default phaserGame;
