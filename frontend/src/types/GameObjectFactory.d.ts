import MyPlayer from '../characters/MyPlayer';
import OtherPlayer from '../characters/OtherPlayer';
import { Block } from '../items/Block';
import Bomb, { Blast, PlayerInterface } from '../items/Bomb';
import Item from '../items/Item';
import { InnerWall, OuterWall } from '../items/Wall';

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
      otherPlayer: (
        sessionId: string,
        x: number,
        y: number,
        texture: string,
        frame?: string | number,
        options?: Phaser.Types.Physics.Matter.MatterBodyConfig
      ) => OtherPlayer;
      bomb: (
        sessionId: string,
        x: number,
        y: number,
        bombStrength: number,
        removedAt: number,
        player: PlayerInterface
      ) => Bomb;
      blast: (
        id: string,
        x: number,
        y: number,
        playKey: string,
        bombStrength: number,
        rectangleX: number,
        rectangleY: number
      ) => Blast;
      item: (x: number, y: number, itemType: Constants.ITEM_TYPES) => Item;
      innerWall: (x: number, y: number, frame: number) => InnerWall;
      outerWall: (x: number, y: number, frame: number) => OuterWall;
      block: (x: number, y: number, frame: number) => Block;
    }
  }
}
