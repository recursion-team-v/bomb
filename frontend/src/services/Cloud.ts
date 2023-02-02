import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';

export function addCloud(scene: Phaser.Scene) {
  const cloudScale =
    Math.floor(Math.random() * (Config.CLOUD_SCALE_MAX + 1 - Config.CLOUD_SCALE_MIN)) +
    Config.CLOUD_SCALE_MIN;
  const cloudFlipX = Math.random() > 0.5;
  const cloud = scene.add
    .container(
      scene.scale.width + 200,
      Constants.HEADER_HEIGHT + scene.scale.height * Math.random(),
      [
        scene.add.image(0, 0, 'cloud').setScale(cloudScale).setOrigin(0, 0).setFlipX(cloudFlipX),
        scene.add
          .image(0, 400, 'cloud')
          .setTintFill(Constants.LIGHT_GRAY)
          .setScale(cloudScale)
          .setAlpha(0.5)
          .setFlipX(cloudFlipX)
          .setOrigin(0, 0),
      ]
    )
    .setDepth(500);

  scene.tweens.add({
    targets: cloud,
    x: -400,
    duration: 10000,
    ease: 'Linear',
    onComplete: () => {
      cloud.destroy();
    },
  });
}
