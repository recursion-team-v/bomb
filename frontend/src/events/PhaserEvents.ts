export const phaserEvents = new Phaser.Events.EventEmitter();

export enum Event {
  PLAYER_JOINED_ROOM = 'player-joined-room',
  PLAYER_LEFT_ROOM = 'player-left-room',
}
