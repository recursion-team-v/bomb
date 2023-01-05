export const gameEvents = new Phaser.Events.EventEmitter();

export enum Event {
  PLAYER_JOINED_ROOM = 'player-joined-room',
  PLAYER_LEFT_ROOM = 'player-left-room',
  TIMER_UPDATED = 'timer-updated',
  GAME_STATE_UPDATED = 'game-state-updated',
  BOMB_ADDED = 'bomb-added',
}
