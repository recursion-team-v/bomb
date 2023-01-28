import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';
const GetValue = Phaser.Utils.Objects.GetValue;

export const createLoginDialog = function (scene: Phaser.Scene, config: any) {
  let username = GetValue(config, 'username', '');
  const title = GetValue(config, 'title', 'Welcome');
  const xValue = GetValue(config, 'x', 0);
  const yValue = GetValue(config, 'y', 0);
  const widthValue = GetValue(config, 'width', undefined);
  const heightValue = GetValue(config, 'height', undefined);

  // Title field object
  const titleField = scene.add.text(0, 0, title, { fontFamily: 'PressStart2P' });

  // User name field object
  const userNameField = scene.rexUI.add.label({
    orientation: 'x',
    background: scene.add.image(0, 0, 'nameBar'),
    text: scene.rexUI.add.canvasInput(xValue, yValue, 300, 54, {
      style: {
        fontSize: 20,
        fontFamily: 'PressStart2P',
        // Solution A
        'cursor.color': 'black',
        'cursor.backgroundColor': 'white',
      },
      maxLength: Constants.MAX_USER_NAME_LENGTH,
      padding: 10,
      wrap: {
        vAlign: 'center',
        hAlign: 'center',
      },
      text: username,
    }),

    space: { top: 5, bottom: 5, left: 5, right: 5 },
  });

  // Login button object
  const loginButton = scene.rexUI.add
    .label({
      orientation: 'x',
      background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, Constants.LIGHT_RED),
      text: scene.add.text(0, 0, 'play game', {
        fontFamily: 'PressStart2P',
        color: 'white',
      }),
      space: { top: 20, bottom: 20, left: 20, right: 20 },
    })
    .setInteractive()
    .on('pointerdown', function () {
      username = userNameField.text;
      loginDialog.emit('playGame', username);
    });

  loginButton.on('pointerover', function () {
    loginButton.setScale(1.05);
  });

  loginButton.on('pointerout', function () {
    loginButton.setScale(1);
  });

  // Dialog and its children
  const loginDialog = scene.rexUI.add
    .sizer({
      orientation: 'y',
      x: xValue,
      y: yValue,
      width: widthValue,
      height: heightValue,
    })
    .add(titleField, 0, 'center', { top: 10, bottom: 10, left: 10, right: 10 }, false)
    .add(userNameField, 0, 'center', { bottom: 40, left: 10, right: 10 }, true)
    .add(loginButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
    .layout();

  return loginDialog;
};

export const addBackground = function (scene: Phaser.Scene) {
  scene.add
    .sprite(0, 0, Config.ASSET_KEY_TITLE_BACKGROUND)
    .setOrigin(0, 0)
    .setScale(1.2)
    .play(Config.TITLE_BACKGROUND_ANIMATION_KEY, true);
};
