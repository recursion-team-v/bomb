import BombInterface from '../../interfaces/bomb';

export default function explosionToBomb(bomb: BombInterface) {
  bomb.detonated(bomb);
}
