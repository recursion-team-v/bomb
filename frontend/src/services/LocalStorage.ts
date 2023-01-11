import { Room } from 'colyseus.js';

import GameRoomState from '../../../backend/src/rooms/schema/GameRoomState';
import * as Config from '../config/config';

export function saveRoomInfoAtLocalStorage(room: Room<GameRoomState>) {
  clearRoomInfoFromLocalStorage();
  localStorage.setItem(Config.LOCAL_STORAGE_KEY_ROOM_ID, room.id);
  localStorage.setItem(Config.LOCAL_STORAGE_KEY_SESSION_ID, room.sessionId);
}

export function getRoomInfoFromLocalStorage() {
  const roomId = localStorage.getItem(Config.LOCAL_STORAGE_KEY_ROOM_ID);
  const sessionId = localStorage.getItem(Config.LOCAL_STORAGE_KEY_SESSION_ID);
  return { roomId, sessionId };
}

export function clearRoomInfoFromLocalStorage() {
  localStorage.removeItem(Config.LOCAL_STORAGE_KEY_ROOM_ID);
  localStorage.removeItem(Config.LOCAL_STORAGE_KEY_SESSION_ID);
}
