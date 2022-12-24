import Bomb from "../items/Bomb";

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
    }
  }
}
declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      bomb: (
        x: number,
        y: number,
        texture: string,
        frame?: string | number,
        options?: Phaser.Types.Physics.Matter.MatterBodyConfig
      ) => Bomb;
    }
  }
}
