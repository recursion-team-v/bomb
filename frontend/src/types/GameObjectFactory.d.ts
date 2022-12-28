import Bomb from '../items/Bomb';
import BombExplosion from '../items/BombExplosion';

export {};

// declare myPlayer type in GameObjectFactory
declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer: (
        x: number,
        y: number,
        texture: string,
        frame?: string | number,
        options?: Phaser.Types.Physics.Matter.MatterBodyConfig
      ) => MyPlayer;

      bomb: (x: number, y: number, bombStrength: number) => Bomb;
      bombExplosion: (x: number, y: number, bombStrength: number) => BombExplosion;
    }
  }
}
