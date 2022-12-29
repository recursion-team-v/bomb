import MyPlayer from '../characters/MyPlayer';
import Bomb from '../items/Bomb';
import BombExplosion from '../items/BombExplosion';
import Item from '../items/Item';
import { ItemTypes } from './items';


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
        options?: Phaser.Types.PhysicsWMatter.MatterBodyConfig
      ) => MyPlayer;
      bomb: (x: number, y: number, bombStrength: number) => Bomb;
      blast: (x: number, y: number, bombStrength: number) => BombExplosion;
      item: (x: number, y: number, itemType: ItemTypes) => Item;
      innerWall: (x: number, y: number, texture) => InnerWall;
    }
  }
}
