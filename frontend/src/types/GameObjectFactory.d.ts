import MyPlayer from '../characters/MyPlayer';
import Bomb, { Blast, PlayerInterface } from '../items/Bomb';
import Item from '../items/Item';
import { InnerWall, OuterWall } from '../items/Wall';
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
        options?: Phaser.Types.Physics.Matter.MatterBodyConfig
      ) => MyPlayer;
      bomb: (
        sessionId: string,
        x: number,
        y: number,
        bombStrength: number,
        player: PlayerInterface
      ) => Bomb;
      blast: (
        x: number,
        y: number,
        playKey: string,
        bombStrength: number,
        rectangleX: number,
        rectangleY: number
      ) => Blast;
      item: (x: number, y: number, itemType: ItemTypes) => Item;
      innerWall: (x: number, y: number, frame: number) => InnerWall;
      outerWall: (x: number, y: number, frame: number) => OuterWall;
    }
  }
}
