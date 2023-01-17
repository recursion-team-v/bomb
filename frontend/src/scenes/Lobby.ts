import * as Config from '../config/config';
import * as Constants from '../../../backend/src/constants/constants';
import Network from '../services/Network';
import { createButton, createButtons, createGridTable } from '../utils/ui';
import Label from 'phaser3-rex-plugins/templates/ui/label/Label';
import GridTable from 'phaser3-rex-plugins/templates/ui/gridtable/GridTable';

export interface IAvailableRoom {
  id: string;
  name: string;
}

export default class Lobby extends Phaser.Scene {
  network!: Network;
  private availableRooms: IAvailableRoom[] = [];
  private gridTable?: GridTable;

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
    this.network.onRoomAdded(this.handleRoomAddedOrRemoved, this);
    this.network.onRoomRemoved(this.handleRoomAddedOrRemoved, this);

    const buttons = createButtons(this, Constants.WIDTH / 2, Constants.HEIGHT / 5, [
      createButton(this, 0, 0, 'Create Room!'),
      createButton(this, 0, 0, 'Join Public Room!'),
    ]);

    buttons.on('button.click', async (button: Label, index: number) => {
      if (this.network.room !== undefined) {
        await this.network.room.leave();
      }
      switch (index) {
        case 0:
          await this.network.createAndJoinCustomRoom({
            name: 'custom room',
            password: null,
            autoDispose: true,
          });
          break;
        case 1:
          await this.network.joinOrCreatePublicRoom();
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

  private handleRoomAddedOrRemoved() {
    this.availableRooms = this.getAvailableRooms();
    this.gridTable?.setItems(this.availableRooms);
    this.gridTable?.refresh();
  }

  private async handleOnRoomClick(cellContainer: any, cellIndex: number) {
    if (cellIndex === -1 || cellIndex >= this.availableRooms.length) return;
    const room = this.availableRooms[cellIndex];
    await this.network.joinCustomRoom(room.id, null);
  }
}
