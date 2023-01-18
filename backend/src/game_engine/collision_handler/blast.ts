import BombInterface from '../../interfaces/bomb';

export function blastToBomb(bomb: BombInterface, bombId: string) {
  bomb.detonated(bombId);
}
