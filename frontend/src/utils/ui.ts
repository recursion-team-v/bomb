import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle';
import Label from 'phaser3-rex-plugins/templates/ui/label/Label';
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
      width: 700,
      height: 700,
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
      content: createDialogContent(scene),
      expand: {
        content: false,
      },
      actions: [createButton(scene, 0, 0, 'Ready?'), createButton(scene, 0, 0, 'exit')],
      space: {
        title: 10,
        content: 10,
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    })
    .layout()
    .popUp(100)
    .setDepth(100);

  dialog.on('button.click', function (button: Label, _: any, index: number) {
    switch (index) {
      case 0:
        button.setText('waiting...');
        (button.getElement('background') as RoundRectangle).setFillStyle(0x6b7280);
        button.layout();
        onClick();
        break;
      case 1:
        // TODO: handle close
        dialog.emit('modal.requestClose');
        break;
    }
  });

  return dialog;
};

export const createDialogContent = (scene: Phaser.Scene) => {
  return scene.rexUI.add
    .gridSizer({
      x: 0,
      y: 0,
      column: 2,
      row: 2,
      width: 500,
      height: 500,
      columnProportions: 1,
      rowProportions: 1,
      space: {
        column: 20,
        row: 20,
      },
    })
    .add(createPlayerCard(scene))
    .add(createPlayerCard(scene))
    .add(createPlayerCard(scene))
    .add(createPlayerCard(scene))
    .layout();
};

export const createPlayerCard = (scene: Phaser.Scene) => {
  const card = scene.rexUI.add
    .label({
      orientation: 1,
      background: scene.rexUI.add
        .roundRectangle(0, 0, 2, 2, 20, 0x374151)
        .setStrokeStyle(2, 0xe2e8f0),
      icon: scene.rexUI.add.container(0, 0, 150, 150, [
        scene.rexUI.add.roundRectangle(0, 0, 150, 150, 20, 0xf87171),
        scene.add.text(0, -60, 'not ready', { color: '#000' }).setOrigin(0.5),
        scene.add.triangle(5, -35, -5, -5, 15, -5, 5, 5, Constants.BLUE).setOrigin(0.5),
        scene.add.sprite(0, 10, 'player').setScale(1.2).play('player_down'),
      ]),
      text: scene.add.text(0, 0, '', { fontSize: '30px' }),
      expandTextWidth: false,
      expandTextHeight: false,
      space: { left: 20, right: 20, top: 20, bottom: 20, icon: 10 },
    })
    .layout();

  const children = card.getChildren();
  const background = card.getElement('background');
  children.forEach((child: any) => {
    if (child === background) {
      child.setFillStyle(0xf87171);
    } else {
      card.setChildVisible(child, false);
    }
  });

  return card;
};

export const flipPlayerCard = (
  scene: Phaser.Scene,
  playerCard: Label,
  currFace: 'back' | 'front'
) => {
  const flip = scene.rexUI.add.flip(playerCard, {
    duration: 400,
    face: currFace,
    front: function (gameObject: any) {
      const children = gameObject.getChildren();
      const background = gameObject.getElement('background');
      for (let i = 0, cnt = children.length; i < cnt; i++) {
        const child = children[i];
        if (child === background) {
          child.setFillStyle(0x374151);
        } else {
          gameObject.setChildVisible(child, true);
        }
      }
    },
    back: function (gameObject: any) {
      const children = gameObject.getChildren();
      const background = gameObject.getElement('background');
      for (let i = 0, cnt = children.length; i < cnt; i++) {
        const child = children[i];
        if (child === background) {
          child.setFillStyle(0xf87171);
        } else {
          gameObject.setChildVisible(child, false);
        }
      }
    },
  });

  flip.flip();
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
            background: scene.rexUI.add
              .roundRectangle(0, 0, 20, 20, 10)
              .setStrokeStyle(2, 0xe2e8f0),
            icon: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, 0xa3e635),
            text: scene.add.text(0, 0, ''),
            space: {
              icon: 10,
              left: 15,
            },
          });
        }

        cellContainer.setAlpha(1);
        cellContainer.setMinSize(width, height);
        cellContainer
          .getElement('text')
          .setText(`${item.name}\n${item.clients}/${item.maxClients}`);
        cellContainer
          .getElement('icon')
          .setFillStyle(item.clients >= item.maxClients ? 0xf87171 : 0xa3e635);
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
