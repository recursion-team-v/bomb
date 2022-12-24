import Phaser from 'phaser';

import Config from './config/ingame';
import Game from './scenes/Game';
import Preloader from './scenes/Preloader';

const ingameConfig = new Config(1);
const game = new Game(ingameConfig);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  backgroundColor: '#64748b',
  pixelArt: true,
  scale: {
    width: 700,
    height: 700,
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
  scene: [Preloader, game],
};

const phaserGame = new Phaser.Game(config);

(window as any).game = phaserGame;

export default phaserGame;
