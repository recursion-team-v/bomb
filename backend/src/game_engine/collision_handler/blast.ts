import BombInterface from '../../interfaces/bomb';

export default function blastToBomb(bomb: BombInterface) {
  bomb.detonated(bomb);
}
