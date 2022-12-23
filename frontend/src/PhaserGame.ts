import Phaser from 'phaser';
import Preloader from './scenes/Preloader';
import Game from './scenes/Game';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  backgroundColor: '#64748b',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    width: 800,
    height: 600,
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
  scene: [Preloader, Game],
};

const phaserGame = new Phaser.Game(config);

(window as any).game = phaserGame;

export default phaserGame;
