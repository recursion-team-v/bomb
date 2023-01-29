import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle';
import Label from 'phaser3-rex-plugins/templates/ui/label/Label';
import * as Constants from '../../../backend/src/constants/constants';
import { IAvailableRoom } from '../scenes/Lobby';

export const createButton = (scene: Phaser.Scene, text: string, color: number) => {
  const button = scene.rexUI.add.label({
    orientation: 'x',
    background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, color),
    text: scene.add.text(0, 0, text, {
      fontFamily: 'PressStart2P',
      color: 'white',
    }),
    align: 'center',
    space: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    },
  });

  button.on('pointerover', function () {
    button.setScale(1.05);
  });

  button.on('pointerout', function () {
    button.setScale(1);
  });

  return button;
};

export const createButtons = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  buttons: Phaser.GameObjects.GameObject[]
) => {
  return scene.rexUI.add.buttons({ x, y, orientation: 'y', buttons, space: { item: 10 } }).layout();
};

export const createDialog = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  onClick: () => void,
  onClose: () => void
) => {
  const dialog = scene.rexUI.add
    .dialog({
      x,
      y,
      width: 900,
      height: 700,
      background: scene.add.image(0, 0, 'board'),
      title: scene.rexUI.add.label({
        background: scene.add.image(0, 0, 'child_board'),
        text: scene.add.text(0, 0, 'waiting for players to become ready...', {
          fontSize: '16px',
          fontFamily: 'PressStart2P',
          color: 'black',
        }),
        align: 'center',
        space: {
          top: 30,
          bottom: 30,
        },
      }),
      content: createDialogContent(scene),
      expand: {
        content: false,
      },
      actions: [
        createButton(scene, 'ready?', Constants.GREEN),
        createButton(scene, 'exit', Constants.GRAY),
      ],
      space: {
        title: 10,
        content: 10,
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
        action: 30,
      },
    })
    .popUp(100)
    .setDepth(200)
    .layout();

  dialog.on('button.click', function (button: Label, _: any, index: number) {
    switch (index) {
      case 0:
        button.setText('waiting');
        (button.getElement('background') as RoundRectangle).setFillStyle(Constants.GRAY);
        button.layout();
        onClick();
        break;
      case 1:
        onClose();
        break;
    }
  });

  return dialog;
};

const createDialogContent = (scene: Phaser.Scene) => {
  const grid = scene.rexUI.add
    .gridSizer({
      x: 0,
      y: 0,
      column: 4,
      row: 1,
      width: 200,
      height: 250,
      columnProportions: 1,
      rowProportions: 1,
      space: {
        top: 10,
        bottom: 10,
        column: 20,
        row: 20,
      },
    })
    .layout();

  for (const character of Constants.CHARACTERS) {
    grid.add(createPlayerCard(scene, character));
  }

  return grid;
};

export const createPlayerCard = (scene: Phaser.Scene, character: string) => {
  const card = scene.rexUI.add
    .label({
      orientation: 1,
      background: scene.rexUI.add
        .roundRectangle(0, 0, 2, 2, 20, 0xdce0d2)
        .setStrokeStyle(8, 0xdce0d2),
      icon: scene.rexUI.add.container(0, 0, 150, 150, [
        scene.rexUI.add.roundRectangle(0, 0, 150, 150, 20, Constants.LIGHT_RED),
        scene.add
          .text(0, -60, 'not ready', {
            fontSize: '12px',
            color: 'white',
            fontFamily: 'PressStart2P',
          })
          .setOrigin(0.5),
        scene.add.triangle(5, -35, -5, -5, 15, -5, 5, 5, Constants.BLUE).setOrigin(0.5),
        scene.add.sprite(0, 10, character).setScale(1.6, 1.3).play(`${character}_idle_down`, true),
      ]),
      text: scene.add
        .text(0, 0, '', { fontSize: '18px', fontFamily: 'PressStart2P' })
        .setOrigin(0.5),
      expandTextWidth: false,
      expandTextHeight: false,
      space: { left: 20, right: 20, top: 20, bottom: 20, icon: 10 },
    })
    .layout();

  const children = card.getChildren();
  const background = card.getElement('background');
  children.forEach((child: any) => {
    if (child === background) {
      child.setFillStyle(0xc1c8b9);
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
    duration: 150,
    face: currFace,
    front: function (gameObject: any) {
      const children = gameObject.getChildren();
      const background = gameObject.getElement('background');
      for (let i = 0, cnt = children.length; i < cnt; i++) {
        const child = children[i];
        if (child === background) {
          child.setFillStyle(Constants.DARK_GRAY);
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
          child.setFillStyle(0xc1c8b9);
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
      background: scene.add.image(0, 0, 'board'),
      table: {
        cellWidth: undefined,
        cellHeight: 80,
        columns: 1,
        mask: {
          padding: 20,
        },
        reuseCellContainer: true,
      },
      slider: {
        track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x6b4b5b),
        thumb: scene.add.image(0, 0, 'slider_thumb'),
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
            background: scene.add.image(0, 0, 'child_board'),
            icon: scene.add.image(0, 0, 'cross').setScale(2),
            text: scene.add.text(0, 0, '', {
              fontSize: '12px',
              fontFamily: 'PressStart2P',
              color: '#000',
            }),
            space: {
              icon: 20,
              left: 15,
            },
          });
        }

        cellContainer.setAlpha(1);
        cellContainer.setMinSize(width, height);
        const text =
          item.id === 'default' ? item.name : `${item.name}\n\n${item.clients}/${item.maxClients}`;
        cellContainer.getElement('text').setText(text);
        cellContainer
          .getElement('icon')
          .setTexture(item.clients >= item.maxClients ? 'cross' : 'check');
        return cellContainer;
      },
      items: availableRooms,
    })
    .layout();

  return gridTable;
};
