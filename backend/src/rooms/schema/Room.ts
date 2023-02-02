import { Schema, type } from '@colyseus/schema';
import * as Constants from '../../constants/constants';

export default class Room extends Schema {
  // マップの行数
  @type('number')
  mapRows: number;

  // マップの列数
  @type('number')
  mapCols: number;

  // CPUの数
  @type('string')
  numberOfCpu: number;

  // ブロックの生成率
  blockRate: Constants.ROOM_INFO_BLOCK_PLACEMENT_RATES;

  // アイテムの生成個数
  numberOfItems: Record<Constants.ITEM_TYPES, number>;

  // ゲーム開始時の初期HP
  @type('number')
  initialHp: number;

  // ゲーム中の最大HP
  maxHp: number;

  // ゲームの制限時間
  @type('number')
  timeLimit: Constants.ROOM_INFO_TIME_LIMIT_SEC_TYPES;

  constructor(
    rows: number = Constants.DEFAULT_TILE_ROWS,
    cols: number = Constants.DEFAULT_TILE_COLS,
    numberOfPlayer: number,
    numberOfCpu: number,
    blockRate: Constants.ROOM_INFO_BLOCK_PLACEMENT_RATES = Constants.ROOM_INFO_DEFAULT_BLOCK_PLACEMENT_RATE,
    numberOfItems: Record<Constants.ITEM_TYPES, number> = Constants.ITEM_PLACE_COUNT,
    initialHp: number = Constants.INITIAL_PLAYER_HP,
    maxHp: number = Constants.MAX_PLAYER_HP,
    timeLimit: Constants.ROOM_INFO_TIME_LIMIT_SEC_TYPES = Constants.ROOM_INFO_DEFAULT_TIME_LIMIT_SEC
  ) {
    super();
    this.mapRows = rows; // TODO: 何らかの制限を加える
    this.mapCols = cols; // TODO: 何らかの制限を加える
    this.numberOfCpu = this.calcNumberOfCpu(numberOfCpu, numberOfPlayer);
    this.blockRate = blockRate;
    this.numberOfItems = this.calcNumberOfItems(numberOfItems);
    this.maxHp = maxHp > Constants.LIMIT_PLAYER_HP ? Constants.LIMIT_PLAYER_HP : maxHp;
    this.initialHp = this.calcInitialHp(initialHp, maxHp);
    this.timeLimit = timeLimit;
  }

  calcNumberOfCpu(numberOfCpu: number, numberOfPlayer: number): number {
    let result: number;

    // プレイヤーが1人の場合
    if (numberOfPlayer === 1) {
      if (numberOfCpu > 0 && numberOfCpu < Constants.MAX_PLAYER - numberOfPlayer) {
        // 有効な値がセットされてれば、その値を使う
        result = numberOfCpu;
      } else {
        // 空きを全て CPU で埋める
        result = Constants.MAX_PLAYER - numberOfPlayer;
      }
    } else {
      // 2人の場合はCPUを最低 0人 入れる
      result = Math.min(Constants.MAX_PLAYER - numberOfPlayer, numberOfCpu);
    }

    return result;
  }

  calcNumberOfItems(
    records: Record<Constants.ITEM_TYPES, number>
  ): Record<Constants.ITEM_TYPES, number> {
    const result = Object.create(records);
    Object.keys(records).forEach((key) => {
      const itemKey = key as Constants.ITEM_TYPES;
      result[itemKey] = Math.min(records[itemKey], Constants.ITEM_PLACE_MAX_COUNT_PER_ITEM);
    });

    return result;
  }

  calcInitialHp(initialHp: number, maxHp: number): number {
    if (initialHp > maxHp) {
      return maxHp;
    }

    if (initialHp < 0) {
      return Constants.INITIAL_PLAYER_HP;
    }

    return initialHp;
  }
}
