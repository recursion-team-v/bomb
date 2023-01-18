import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import Block from '../../rooms/schema/Block';
import Item from '../../rooms/schema/Item';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class MapService {
  private readonly gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  createMapWalls(rows: number, cols: number) {
    const tileWidth = Constants.TILE_WIDTH;
    const tileHeight = Constants.TILE_HEIGHT;
    const walls = [];

    // outer walls
    for (let y = 0; y < rows; y++) {
      walls.push(this.createWall(0, y, tileWidth, tileHeight));
      walls.push(this.createWall(cols - 1, y, tileWidth, tileHeight));
    }
    for (let x = 1; x < cols - 1; x++) {
      walls.push(this.createWall(x, 0, tileWidth, tileHeight));
      walls.push(this.createWall(x, rows - 1, tileWidth, tileHeight));
    }

    // inner walls
    for (let y = 2; y < rows; y += 2) {
      for (let x = 2; x < cols; x += 2) {
        walls.push(this.createWall(x, y, tileWidth, tileHeight, Constants.TILE_WALL.INNER_CHAMFER));
      }
    }

    Matter.Composite.add(this.gameEngine.world, walls);
  }

  createMapBlocks(rows: number, cols: number, blockArr: number[]) {
    // ブロックが存在する index を取得
    const blockIndices: number[] = [];
    blockArr.forEach((v, idx) => v === Constants.TILE_BLOCK_IDX && blockIndices.push(idx));

    // 配置するアイテムのリストを作成
    const items: Constants.ITEM_TYPES[] = [];
    Object.keys(Constants.ITEM_PLACE_COUNT).forEach((v) => {
      const key = v as Constants.ITEM_TYPES;
      items.push(...Array(Constants.ITEM_PLACE_COUNT[key]).fill(key));
    });

    // アイテムリストがブロック数と同じになるように調整
    const diff = blockIndices.length - items.length;
    if (diff > 0) {
      items.push(...Array(diff).fill(Constants.ITEM_TYPE.NONE));
    }

    // アイテムのリストをシャッフル
    const shuffledItems = items.sort(() => Math.random() - 0.5);

    // ブロックを作成
    const blocks: Matter.Body[] = [];
    blockIndices.forEach((v, i) => {
      const x = v % cols;
      const y = Math.floor(v / cols);
      blocks.push(
        this.createBlock(x, y, Constants.TILE_WIDTH, Constants.TILE_HEIGHT, shuffledItems[i])
      );
    });

    Matter.Composite.add(this.gameEngine.world, blocks);
  }

  private createWall(x: number, y: number, tileWidth: number, tileHeight: number, radius = 0) {
    return Matter.Bodies.rectangle(
      tileWidth / 2 + tileWidth * x,
      Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y,
      tileWidth,
      tileHeight,
      {
        chamfer: {
          radius,
        },
        isStatic: true,
        label: Constants.OBJECT_LABEL.WALL,
      }
    );
  }

  private createBlock(
    x: number,
    y: number,
    tileWidth: number,
    tileHeight: number,
    itemType?: Constants.ITEM_TYPES
  ) {
    const blockBody = Matter.Bodies.rectangle(
      tileWidth / 2 + tileWidth * x,
      Constants.HEADER_HEIGHT + tileHeight / 2 + tileHeight * y,
      tileWidth,
      tileHeight,
      {
        isStatic: true,
        label: Constants.OBJECT_LABEL.BLOCK,
      }
    );

    if (itemType === Constants.ITEM_TYPE.NONE) itemType = undefined;

    const block = new Block(
      blockBody.id.toString(),
      blockBody.position.x,
      blockBody.position.y,
      itemType
    );
    this.gameEngine.blockBodies.set(block.id, blockBody);
    this.gameEngine.state.blocks.set(block.id, block);

    return blockBody;
  }

  destroyBlock(block: Block) {
    const blockBody = this.gameEngine.blockBodies.get(block.id);
    if (blockBody === undefined) return;
    Matter.Composite.remove(this.gameEngine.world, blockBody);
    this.gameEngine.blockBodies.delete(block.id);
    this.gameEngine.state.blocks.delete(block.id);
    if (block.itemType !== undefined) {
      const item = new Item(block.x, block.y, block.itemType);
      this.gameEngine.itemService.addItem(item);
    }
  }
}
