import Player from '../characters/Player';
import MyPlayer from '../characters/MyPlayer';
import OtherPlayer from '../characters/OtherPlayer';
import { Block } from '../items/Block';
import Bomb, { Blast } from '../items/Bomb';
import Item from '../items/Item';
import { InnerWall, OuterWall, DropWall } from '../items/Wall';

export {};

// declare myPlayer type in GameObjectFactory
declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      player: (
        sessionId: string,
        x: number,
        y: number,
        texture: string,
        frame?: string | number,
        options?: Phaser.Types.Physics.Matter.MatterBodyConfig
      ) => Player;
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
      bomb: (id: string, sessionId: string, x: number, y: number, removedAt: number) => Bomb;
      blast: (
        sessionId: string,
        x: number,
        y: number,
        playKey: string,
        rectangleX: number,
        rectangleY: number
      ) => Blast;
      item: (x: number, y: number, itemType: Constants.ITEM_TYPES) => Item;
      innerWall: (x: number, y: number, frame: number) => InnerWall;
      outerWall: (x: number, y: number, frame: number) => OuterWall;
      dropWall: (x: number, y: number, frame: number) => DropWall;
      block: (x: number, y: number, frame: number) => Block;
    }
  }
}
