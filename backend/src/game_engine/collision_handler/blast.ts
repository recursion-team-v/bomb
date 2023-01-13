import BombInterface from '../../interfaces/bomb';
import PlayerInterface from '../../interfaces/player';
import * as Constants from '../../constants/constants';

export function blastToBomb(bomb: BombInterface, bombId: string) {
  bomb.detonated(bombId);
}

export function blastToPlayer(player: PlayerInterface) {
  player.damaged(Constants.BOMB_DAMAGE);
}
