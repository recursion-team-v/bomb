const GetValue = Phaser.Utils.Objects.GetValue;

export const createLoginDialog = function (scene: Phaser.Scene, config: any) {
  let username = GetValue(config, 'username', '');
  const title = GetValue(config, 'title', 'Welcome');
  const xValue = GetValue(config, 'x', 0);
  const yValue = GetValue(config, 'y', 0);
  const widthValue = GetValue(config, 'width', undefined);
  const heightValue = GetValue(config, 'height', undefined);

  // Title field object
  const titleField = scene.add.text(0, 0, title, { fontFamily: '"Press Start 2P", cursive' });

  // User name field object
  const userNameField = scene.rexUI.add.label({
    orientation: 'x',
    background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(1, 0x959595),
    text: scene.rexUI.add.canvasInput(xValue, yValue, 300, 36, {
      style: {
        fontSize: 20,
        fontFamily: '"Press Start 2P", cursive',
        // Solution A
        'cursor.color': 'black',
        'cursor.backgroundColor': 'white',
      },
      padding: 10,
      wrap: {
        vAlign: 'center',
      },
      text: username,
    }),

    space: { top: 5, bottom: 5, left: 5, right: 5 },
  });

  // Login button object
  const loginButton = scene.rexUI.add
    .label({
      orientation: 'x',
      background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x959595),
      text: scene.add.text(0, 0, 'play game', {
        fontFamily: '"Press Start 2P", cursive',
      }),
      space: { top: 10, bottom: 10, left: 10, right: 10 },
    })
    .setInteractive()
    .on('pointerdown', function () {
      username = userNameField.text;
      loginDialog.emit('playGame', username);
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
    .add(userNameField, 0, 'center', { bottom: 10, left: 10, right: 10 }, true)
    .add(loginButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
    .layout();

  return loginDialog;
};
