import GridTable from 'phaser3-rex-plugins/templates/ui/gridtable/GridTable';

import * as Constants from '../../../backend/src/constants/constants';

export function addDebugMenu(scene: Phaser.Scene): GridTable {
  return scene.rexUI.add
    .gridTable({
      x: Constants.WIDTH / 2,
      y: Constants.HEIGHT / 5 + 300,
      width: 400,
      height: 400,
      scrollMode: 0,
      background: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, Constants.DARK_GRAY),
      table: {
        cellWidth: undefined,
        cellHeight: 40,
        columns: 1,
        mask: {
          padding: 2,
        },
        reuseCellContainer: true,
      },
      slider: {
        track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 374151),
        thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, Constants.WHITE),
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
        const item = cell.item as IDebugOption;

        if (cellContainer === null) {
          cellContainer = scene.rexUI.add
            .label({
              width,
              height,
              orientation: 0,
              background: scene.rexUI.add
                .roundRectangle(0, 0, 20, 20, 10)
                .setStrokeStyle(2, Constants.WHITE),
              text: scene.add.text(0, 0, ''),
              space: {
                left: 15,
              },
            })
            .setDepth(9001);
        }

        cellContainer.setAlpha(1);
        cellContainer.setMinSize(width, height);
        cellContainer.getElement('text').setText(item.text);
        cellContainer.getElement('background').setStrokeStyle(2, Constants.GRAY).setDepth(0);
        return cellContainer;
      },
      items: debugOptions,
    })
    .layout()
    .setDepth(9000)
    .setVisible(false);
}

export const debugOptions = [
  { text: '一人勝ち', notificationType: Constants.NOTIFICATION_TYPE.DEBUG_PLAYER_WIN },
  { text: '引き分け', notificationType: Constants.NOTIFICATION_TYPE.DEBUG_DRAW },
  {
    text: 'ステータスを最強にする',
    notificationType: Constants.NOTIFICATION_TYPE.DEBUG_PLAYER_STATUS_MAX,
  },
  {
    text: '全員のステータスを最強にする',
    notificationType: Constants.NOTIFICATION_TYPE.DEBUG_ALL_PLAYER_STATUS_MAX,
  },
  {
    text: '全てのブロックを削除する',
    notificationType: Constants.NOTIFICATION_TYPE.DEBUG_DELETE_ALL_BLOCK,
  },
  {
    text: '全てのCPUの動きを止める',
    notificationType: Constants.NOTIFICATION_TYPE.DEBUG_FREEZE_ALL_CPU,
  },
  {
    text: '全てのCPUの動きを再開する',
    notificationType: Constants.NOTIFICATION_TYPE.DEBUG_UNFREEZE_ALL_CPU,
  },
];

interface IDebugOption {
  text: string;
}
