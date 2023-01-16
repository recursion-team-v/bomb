import Phaser from 'phaser';
import Bomb from '../items/Bomb';
import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';

Phaser.GameObjects.GameObjectFactory.register(
  'penetrationBomb',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    id: string,
    sessionId: string,
    x: number,
    y: number,
    bombType: Constants.BOMB_TYPES,
    bombStrength: number,
    removedAt: number
  ) {
    const sprite = new Bomb(
      id,
      sessionId,
      this.scene.matter.world,
      x,
      y,
      bombType,
      bombStrength,
      'penetration_bomb',
      removedAt
    );

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    sprite.setStatic(true);
    sprite.setSensor(true);

    // 爆弾のアニメーションを設定
    // 爆弾のアニメーションは、爆発するまでの時間に応じて速度を変える
    sprite.play(
      {
        key: Config.PENETRATION_BOMB_ANIMATION_KEY,
        // 秒間に表示する画像の枚数
        frameRate: Config.BOMB_SPRITE_FRAME_COUNT / (sprite.getRemainTime() / 1000),
      },
      false
    );

    // サーバからもらった爆発時間になったら爆発するため、定期的に確認する
    const timer = setInterval(() => {
      if (sprite.isRemovedTime()) {
        // 誘爆などの理由により既に爆発している場合は何もしない
        if (!sprite.getIsExploded()) {
          sprite.explode();
          sprite.afterExplosion();
        }
        clearInterval(timer);
      }
    }, 10); // サーバとの遅延を減らすため、10msごとに確認

    return sprite;
  }
);
