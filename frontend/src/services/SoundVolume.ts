import { isMute, toggle } from '../utils/sound';
import * as Config from '../config/config';

export default class VolumeIcon extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    isPlay: boolean = Config.SOUND_DEFAULT_IS_PLAY
  ) {
    super(scene, x, y, isPlay ? Config.ASSET_KEY_VOLUME_ON : Config.ASSET_KEY_VOLUME_OFF);
    this.setOrigin(0, 0);
    this.setInteractive();
    this.on('pointerdown', () => this.updateVolumeIcon());
  }

  private updateVolumeIcon() {
    toggle();
    this.setTexture(volumeIcon());
  }
}

export function volumeIcon(): string {
  return isMute() ? Config.ASSET_KEY_VOLUME_ON : Config.ASSET_KEY_VOLUME_OFF;
}

Phaser.GameObjects.GameObjectFactory.register(
  'volumeIcon',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    scene: Phaser.Scene,
    x: number,
    y: number,
    isPlay?: boolean
  ) {
    const sprite = new VolumeIcon(scene, x, y, isPlay);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    return sprite;
  }
);
