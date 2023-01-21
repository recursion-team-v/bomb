import GameRoomState from './schema/GameRoomState';
import GameResult from './schema/GameResult';
import * as Constants from '../constants/constants';
import Player from './schema/Player';

export function generateGameResult(state: GameRoomState): GameResult | undefined {
  let winner: Player | undefined;
  const win = Constants.GAME_RESULT.WIN;
  const draw = Constants.GAME_RESULT.DRAW;

  // ゲームが開始中のみ結果を返す
  if (!state.gameState.isPlaying()) return;

  // 0人の場合は引き分け
  if (state.getPlayersCount() === 0 || state.getAlivePlayers().length === 0) {
    return new GameResult(winner, state.getPlayers(), draw);
  }

  // 1人の場合は、その人が勝者
  if (state.getPlayersCount() === 1 || state.getAlivePlayers().length === 1) {
    return new GameResult(state.getAlivePlayers()[0], state.getPlayers(), win);
  }

  // 2人~ 場合は、タイムアップのみ
  // まだタイムアップしていない場合は、結果を返さない
  if (state.timer.isInTime()) return;

  // 時間切れの場合は、引き分け
  return new GameResult(winner, state.getPlayers(), draw);
}
