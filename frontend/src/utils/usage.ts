const GetValue = Phaser.Utils.Objects.GetValue;

export const createUsageDialog = function (scene: Phaser.Scene, config: any) {
  const x = GetValue(config, 'x', 0);
  const y = GetValue(config, 'y', 0);

  // Title field object
  scene.add.text(x, y, 'usage', {
    fontFamily: 'PressStart2P',
  });

  scene.rexUI.add
    .badgeLabel({
      x: x,
      y: y,
      width: 80,
      height: 80,
      space: { left: -5, right: -5, top: -5, bottom: -5 },

      background: scene.rexUI.add.roundRectangle(x, y, 2, 2, 10),

      // main: this.add.text(0, 0, 'Item', { fontSize: '20px', color: 'white' }),
      main: scene.rexUI.add.label({
        icon: scene.rexUI.add.roundRectangle(x, y, 10, 10, 5),
        text: scene.add.text(0, 0, 'Item'),
      }),
    })
    .layout();
};
