import MyPlayer from '../characters/MyPlayer';
import Player from '../characters/Player';
import Bomb, { Blast } from '../items/Bomb';
import Item from '../items/Item';
import { InnerWall, OuterWall } from '../items/Wall';
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
      bomb: (x: number, y: number, bombStrength: number, player: Player) => Bomb;
      blast: (x: number, y: number, playKey: string, bombStrength: number) => Blast;
      item: (x: number, y: number, itemType: ItemTypes) => Item;
      innerWall: (x: number, y: number, frame: number) => InnerWall;
      outerWall: (x: number, y: number, frame: number) => OuterWall;
    }
  }
}
