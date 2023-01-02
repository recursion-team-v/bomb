import MyPlayer from '../characters/MyPlayer';
import Bomb, { Blast, PlayerInterface } from '../items/Bomb';
import Item from '../items/Item';
import { ItemTypes } from './items';

export {};

// declare myPlayer type in GameObjectFactory
declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer: (
        sessionId: string,
        x: number,
        y: number,
        texture: string,
        frame?: string | number,
        options?: Phaser.Types.PhysicsWMatter.MatterBodyConfig
      ) => MyPlayer;
      bomb: (x: number, y: number, bombStrength: number, player: PlayerInterface) => Bomb;
      blast: (x: number, y: number, playKey: string, bombStrength: number) => Blast;
      item: (x: number, y: number, itemType: ItemTypes) => Item;
      innerWall: (x: number, y: number, texture) => InnerWall;
    }
  }
}
