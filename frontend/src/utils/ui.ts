import * as Constants from '../../../backend/src/constants/constants';
import { IAvailableRoom } from '../scenes/Lobby';

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

export const createButtons = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  buttons: Phaser.GameObjects.GameObject[]
) => {
  return scene.rexUI.add.buttons({ x, y, orientation: 'y', buttons, space: { item: 10 } }).layout();
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

export const createGridTable = (scene: Phaser.Scene, availableRooms: IAvailableRoom[]) => {
  const gridTable = scene.rexUI.add
    .gridTable({
      x: Constants.WIDTH / 2,
      y: Constants.HEIGHT / 5 + 300,
      width: 400,
      height: 400,
      scrollMode: 0,
      background: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x374151),
      table: {
        cellWidth: undefined,
        cellHeight: 80,
        columns: 1,
        mask: {
          padding: 2,
        },
        reuseCellContainer: true,
      },
      slider: {
        track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 374151),
        thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xe2e8f0),
      },
      space: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
        table: 10,
        header: 10,
        footer: 10,
      },
      createCellContainerCallback: function (cell, cellContainer: any) {
        const scene = cell.scene;
        const width = cell.width;
        const height = cell.height;
        const item = cell.item as IAvailableRoom;

        if (cellContainer === null) {
          cellContainer = scene.rexUI.add.label({
            width,
            height,
            orientation: 0,
            background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, 0xe2e8f0),
            icon: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, 0xa3e635),
            text: scene.add.text(0, 0, ''),
            space: {
              icon: 10,
              left: 15,
            },
          });
        }

        cellContainer.setAlpha(1);
        cellContainer.setMinSize(width, height); // Size might changed in this demo
        cellContainer.getElement('text').setText(item.name + '\n' + item.id); // Set text of text object
        // cellContainer.getElement('icon').setFillStyle(item.color);
        cellContainer.getElement('background').setStrokeStyle(2, 0x6b7280).setDepth(0);
        return cellContainer;
      },
      items: availableRooms,
    })
    .layout();

  gridTable
    .on(
      'cell.over',
      function (cellContainer: any, cellIndex: number) {
        cellContainer.getElement('background').setStrokeStyle(2, 0xe2e8f0).setDepth(1);
      },
      this
    )
    .on(
      'cell.out',
      function (cellContainer: any, cellIndex: number) {
        cellContainer.getElement('background').setStrokeStyle(2, 0x6b7280).setDepth(0);
      },
      this
    );

  return gridTable;
};
