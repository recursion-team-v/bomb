import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';

const GetValue = Phaser.Utils.Objects.GetValue;

export const createUsageDialog = function (scene: Phaser.Scene, config: any) {
  const xValue = GetValue(config, 'x', 0);
  const yValue = GetValue(config, 'y', 0);

  // Title field object
  scene.add.text(xValue, yValue, 'usage', {
    fontFamily: 'PressStart2P',
  });

  scene.rexUI.add
    .badgeLabel({
      x: xValue,
      y: yValue,

      background: scene.rexUI.add.roundRectangle(xValue, yValue, 2, 2, 10),

      // main: this.add.text(0, 0, 'Item', { fontSize: '20px', color: 'white' }),
      main: scene.rexUI.add.label({
        icon: scene.rexUI.add.roundRectangle(xValue, yValue, 10, 10, 5),
        text: scene.add.text(0, 0, 'Item'),
      }),
    })
    .layout();
};

export const createTextBox = function (
  scene: Phaser.Scene,
  xValue: number,
  yValue: number,
  config: any
) {
  const wrapWidth = GetValue(config, 'wrapWidth', 0);
  const fixedWidth = GetValue(config, 'fixedWidth', 0);
  const fixedHeight = GetValue(config, 'fixedHeight', 0);
  const textBox = scene.rexUI.add
    .textBox({
      x: xValue,
      y: yValue,

      background: scene.rexUI.add
        .roundRectangle(xValue, yValue, 2, 2, 20, Constants.LIGHT_GRAY)
        .setAlpha(0.8),

      text: getBuiltInText(scene, wrapWidth, fixedWidth, fixedHeight),
      // text: getBBcodeText(scene, wrapWidth, fixedWidth, fixedHeight),

      space: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 30,
        icon: 10,
        text: 10,
      },
    })
    .setOrigin(0)
    .layout();

  return textBox;
};

const getBuiltInText = function (
  scene: Phaser.Scene,
  wrapWidth: number,
  fixedWidth: number,
  fixedHeight: number
) {
  return scene.add
    .text(0, 0, 'How to Play', {
      fontFamily: 'PressStart2P',
      fontSize: '20px',
      wordWrap: {
        width: wrapWidth,
      },
      maxLines: 3,
      align: 'center',
    })
    .setFixedSize(fixedWidth, fixedHeight);
};

export const createBombUsage = function (scene: Phaser.Scene, x: number, y: number) {
  const group = scene.add.group();
  group.add(
    scene.add
      .sprite(x, y - 20, 'bomb')
      .setScale(0.8)
      .play({ key: Config.BOMB_ANIMATION_KEY, repeat: -1 })
  );
  group.add(scene.add.image(x, y + 50, 'space'));
  group.add(scene.add.text(x - 80, y + 120, 'Place Bomb').setFontFamily('PressStart2P'));
};

export const createMoveUsage = function (scene: Phaser.Scene, x: number, y: number) {
  const group = scene.add.group();
  group.add(scene.add.image(x, y - 10, 'top').setScale(3));
  group.add(scene.add.image(x - 60, y + 50, 'left').setScale(3));
  group.add(scene.add.image(x + 55, y + 50, 'right').setScale(3));
  group.add(scene.add.image(x, y + 110, 'down').setScale(3));
  group.add(
    scene.add
      .sprite(x, y + 50, Constants.CHARACTERS[1])
      .setScale(0.9)
      .play(`${Constants.CHARACTERS[0]}_down`)
  );
  group.add(scene.add.text(x - 30, y + 170, 'Move').setFontFamily('PressStart2P'));
};

export const createItemUsage = function (scene: Phaser.Scene, x: number, y: number) {
  const group = scene.add.group();
  group.add(scene.add.image(x, y, Constants.ITEM_TYPE.BOMB_POSSESSION_UP).setScale(0.4));
  group.add(
    scene.add
      .text(x + 30, y - 10, 'Possession Up')
      .setScale(0.8)
      .setFontFamily('PressStart2P')
  );
  group.add(scene.add.image(x, y + 50, Constants.ITEM_TYPE.BOMB_STRENGTH).setScale(0.4));
  group.add(
    scene.add
      .text(x + 30, y + 40, 'Strength Up')
      .setScale(0.8)
      .setFontFamily('PressStart2P')
  );

  group.add(scene.add.image(x, y + 100, Constants.ITEM_TYPE.PLAYER_SPEED).setScale(0.4));
  group.add(
    scene.add
      .text(x + 30, y + 90, 'Speed Up')
      .setScale(0.8)
      .setFontFamily('PressStart2P')
  );

  group.add(scene.add.image(x, y + 150, Constants.ITEM_TYPE.HEART).setScale(0.4));
  group.add(
    scene.add
      .text(x + 30, y + 140, 'HP Up')
      .setScale(0.8)
      .setFontFamily('PressStart2P')
  );
  group.add(scene.add.text(x + 60, y + 190, 'Items').setFontFamily('PressStart2P'));
};
