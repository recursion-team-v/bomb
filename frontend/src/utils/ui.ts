export const createButton = (scene: Phaser.Scene, x: number, y: number, text: string) => {
  return scene.rexUI.add.label({
    width: 100,
    height: 40,
    background: scene.rexUI.add.roundRectangle(x, y, 0, 0, 20, 0xa3e635),
    text: scene.add.text(0, 0, text, {
      fontSize: '18px',
      color: '#000',
    }),
    space: {
      left: 20,
      right: 20,
    },
  });
};

export const createDialog = (scene: Phaser.Scene, x: number, y: number, onClick: () => void) => {
  const dialog = scene.rexUI.add
    .dialog({
      x,
      y,
      width: 800,
      height: 400,
      background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0xcbd5e1),
      title: scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x6b7280),
        text: scene.add.text(0, 0, 'Waiting for players to join...', {
          fontSize: '20px',
        }),
        space: {
          left: 15,
          right: 15,
          top: 10,
          bottom: 10,
        },
      }),
      actions: [createButton(scene, 0, 0, 'Start Game!')],
      space: {
        title: 10,
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    })
    .layout()
    .popUp(200);

  dialog.on('button.click', function () {
    onClick();
  });

  return dialog;
};
