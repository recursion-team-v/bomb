export const gameEvents = new Phaser.Events.EventEmitter();

export enum Event {
  ROOMS_UPDATED = 'rooms-updated',
  MY_PLAYER_JOINED_ROOM = 'my-player-joined-room',
  PLAYER_JOINED_ROOM = 'player-joined-room',
  PLAYER_LEFT_ROOM = 'player-left-room',
  TIMER_UPDATED = 'timer-updated',
  GAME_START_INFO_RECEIVED = 'game-start-info-received',
  GAME_STATE_UPDATED = 'game-state-updated',
  BOMB_ADDED = 'bomb-added',
  BOMB_REMOVED = 'bomb-removed',
  BLOCKS_REMOVED = 'blocks-removed',
  ITEM_ADDED = 'item-added',
  ITEM_REMOVED = 'item-removed',
  BLAST_ADDED = 'blast-added',
  BLAST_REMOVED = 'blast-removed',
}
