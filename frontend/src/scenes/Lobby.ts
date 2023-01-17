import * as Config from '../config/config';
import * as Constants from '../../../backend/src/constants/constants';
import Network from '../services/Network';
import { createButton, createButtons, createDialog, createGridTable } from '../utils/ui';
import Label from 'phaser3-rex-plugins/templates/ui/label/Label';
import GridTable from 'phaser3-rex-plugins/templates/ui/gridtable/GridTable';
import Dialog from 'phaser3-rex-plugins/templates/ui/dialog/Dialog';

export interface IAvailableRoom {
  id: string;
  name: string;
}

export default class Lobby extends Phaser.Scene {
  network!: Network;
  private availableRooms: IAvailableRoom[] = [];
  private gridTable?: GridTable;
  private dialog?: Dialog;

  constructor() {
    super(Config.SCENE_NAME_LOBBY);
  }

  create(data: { network: Network }) {
    if (data.network === undefined) {
      throw new Error('server instance missing');
    } else {
      this.network = data.network;
    }

    this.availableRooms = this.getAvailableRooms();
    this.network.onRoomsUpdated(this.handleRoomsUpdated, this);

    const buttons = createButtons(this, Constants.WIDTH / 2, Constants.HEIGHT / 5, [
      createButton(this, 0, 0, 'Create Room!'),
      createButton(this, 0, 0, 'Join Test Public Room!'),
    ]);

    buttons.on('button.click', async (button: Label, index: number) => {
      if (this.network.room !== undefined) {
        await this.network.room.leave();
      }
      switch (index) {
        case 0:
          if (this.dialog == null) {
            this.gridTable?.setVisible(false);
            await this.network.createAndJoinCustomRoom({
              name: 'custom room',
              password: null,
              autoDispose: true,
            });
            this.dialog = createDialog(this, Constants.WIDTH / 2, Constants.HEIGHT / 2, () =>
              this.handleGameStart()
            );
          }
          break;
        case 1:
          if (this.dialog == null) {
            this.gridTable?.setVisible(false);
            await this.network.joinOrCreatePublicRoom();
            this.dialog = createDialog(this, Constants.WIDTH / 2, Constants.HEIGHT / 2, () =>
              this.handleGameStart()
            );
          }
          break;
      }
    });

    this.gridTable = createGridTable(this, this.availableRooms);
    this.gridTable.on('cell.click', this.handleOnRoomClick, this);
  }

  private getAvailableRooms() {
    const availableRooms: IAvailableRoom[] = [];
    for (const room of this.network.allRooms) {
      availableRooms.push({
        id: room.roomId,
        name: room.metadata?.name,
      });
    }
    return availableRooms;
  }

  private handleRoomsUpdated() {
    this.availableRooms = this.getAvailableRooms();
    this.gridTable?.setItems(this.availableRooms);
    this.gridTable?.refresh();
  }

  private async handleOnRoomClick(cellContainer: any, cellIndex: number) {
    if (cellIndex === -1 || cellIndex >= this.availableRooms.length) return;
    if (this.network.room !== undefined) {
      await this.network.room.leave();
    }
    const room = this.availableRooms[cellIndex];
    if (this.dialog == null) {
      await this.network.joinCustomRoom(room.id, null);
      this.dialog = createDialog(this, Constants.WIDTH / 2, Constants.HEIGHT / 2, () =>
        this.handleGameStart()
      );
    }
  }

  private handleGameStart() {
    this.scene.start(Config.SCENE_NAME_GAME, { network: this.network });
    this.scene.start(Config.SCENE_NAME_GAME_HEADER, { network: this.network });
  }
}
