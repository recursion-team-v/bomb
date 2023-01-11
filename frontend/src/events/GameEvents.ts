export const gameEvents = new Phaser.Events.EventEmitter();

export enum Event {
  // ゲーム開始前の準備(演出)が完了し、プレイヤーが操作できるようになった
  GAME_PREPARING_COMPLETED = 'game-preparing-completed',
  MY_PLAYER_JOINED_ROOM = 'my-player-joined-room',
  PLAYER_JOINED_ROOM = 'player-joined-room',
  PLAYER_LEFT_ROOM = 'player-left-room',
  TIMER_UPDATED = 'timer-updated',
  GAME_STATE_UPDATED = 'game-state-updated',
  BOMB_ADDED = 'bomb-added',
  BLOCKS_REMOVED = 'blocks-removed',
  ITEM_ADDED = 'item-added',
  ITEM_REMOVED = 'item-removed',
}
