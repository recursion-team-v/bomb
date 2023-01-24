import * as Config from '../config/config';
import * as Constants from '../../../backend/src/constants/constants';
import Network, { IGameStartInfo } from '../services/Network';
import {
  createButton,
  createButtons,
  createDialog,
  createGridTable,
  flipPlayerCard,
} from '../utils/ui';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import GridTable from 'phaser3-rex-plugins/templates/ui/gridtable/GridTable';
import Dialog from 'phaser3-rex-plugins/templates/ui/dialog/Dialog';
import GridSizer from 'phaser3-rex-plugins/templates/ui/gridsizer/GridSizer';
import Label from 'phaser3-rex-plugins/templates/ui/label/Label';

export interface IAvailableRoom {
  id: string;
  name: string;
  clients: number;
  maxClients: number;
}

export default class Lobby extends Phaser.Scene {
  network!: Network;
  private availableRooms: IAvailableRoom[] = [];
  private gridTable?: GridTable;
  private dialog?: Dialog;
  private playerName = '';

  constructor() {
    super(Config.SCENE_NAME_LOBBY);
  }

  create(data: { network: Network; playerName: string }) {
    if (data.network === undefined) {
      throw new Error('server instance missing');
    } else {
      this.network = data.network;
    }
    this.playerName = data.playerName;

    this.availableRooms = this.getAvailableRooms();
    this.network.onRoomsUpdated(this.handleRoomsUpdated, this);
    this.network.onGameStartInfo((data: IGameStartInfo) => {
      this.handleGameStart(data);
    });
    this.network.onMyPlayerJoinedRoom((players) => {
      players.forEach((player, sessionId) => {
        if (sessionId === this.network.mySessionId) {
          this.addMyPlayerCard(player);
        } else {
          this.addOtherPlayerCard(player);
        }
      });
    });
    this.network.onPlayerJoinedRoom((player) => {
      this.addOtherPlayerCard(player);
    });
    this.network.onPlayerLeftRoom((player) => {
      this.removePlayerCard(player);
    });

    const buttons = createButtons(this, Constants.WIDTH / 2, Constants.HEIGHT / 5, [
      createButton(this, 0, 0, 'Create Room'),
    ]);
    buttons.on('button.click', this.handleRoomCreate, this);

    this.gridTable = createGridTable(this, this.availableRooms);
    this.gridTable.on('cell.click', this.handleRoomJoin, this);
  }

  private getAvailableRooms() {
    const availableRooms: IAvailableRoom[] = [];
    for (const room of this.network.allRooms) {
      availableRooms.push({
        id: room.roomId,
        name: room.metadata?.name,
        clients: room.clients,
        maxClients: room.maxClients,
      });
    }
    return availableRooms;
  }

  private handleRoomsUpdated() {
    this.availableRooms = this.getAvailableRooms();
    this.gridTable?.setItems(this.availableRooms);
    this.gridTable?.refresh();
  }

  private async handleRoomCreate() {
    if (this.network.room !== undefined) {
      await this.network.room.leave();
    }

    if (this.dialog == null) {
      this.gridTable?.setVisible(false);
      await this.network.createAndJoinCustomRoom({
        name: this.playerName,
        password: null,
        autoDispose: true,
        playerName: this.playerName,
      });
      this.dialog = createDialog(this, Constants.WIDTH / 2, Constants.HEIGHT / 2, () => {
        this.network.sendPlayerGameState(Constants.PLAYER_GAME_STATE.READY);
      });
    }
  }

  private async handleRoomJoin(cellContainer: any, cellIndex: number) {
    if (cellIndex === -1 || cellIndex >= this.availableRooms.length) return;
    if (this.network.room !== undefined) {
      await this.network.room.leave();
    }
    const room = this.availableRooms[cellIndex];
    if (this.dialog == null) {
      await this.network.joinCustomRoom(room.id, null, this.playerName);
      this.dialog = createDialog(this, Constants.WIDTH / 2, Constants.HEIGHT / 2, () =>
        this.network.sendPlayerGameState(Constants.PLAYER_GAME_STATE.READY)
      );
    }
  }

  private handleGameStart(data: IGameStartInfo) {
    const { serverTimer } = data;
    this.scene.start(Config.SCENE_NAME_GAME, { network: this.network, serverTimer });
    this.scene.start(Config.SCENE_NAME_GAME_HEADER, { network: this.network, serverTimer });
  }

  private addMyPlayerCard(player: ServerPlayer) {
    if (this.dialog != null) {
      const dialogContent = this.dialog?.getElement('content') as GridSizer;
      const playerCard = dialogContent.getChildren().at(player.idx) as Label;
      playerCard.setText(this.playerName);
      this.dialog?.layout();
      setTimeout(() => {
        flipPlayerCard(this, playerCard, 'back');
      }, 200);
    }
  }

  private addOtherPlayerCard(player: ServerPlayer) {
    if (this.dialog != null) {
      const dialogContent = this.dialog.getElement('content') as GridSizer;
      const playerCard = dialogContent.getChildren().at(player.idx) as Label;
      playerCard.setText(player.name);
      this.dialog.layout();
      setTimeout(() => {
        flipPlayerCard(this, playerCard, 'back');
      }, 200);
    }
  }

  private removePlayerCard(player: ServerPlayer) {
    if (this.dialog != null) {
      const dialogContent = this.dialog.getElement('content') as GridSizer;
      const playerCard = dialogContent.getChildren().at(player.idx) as Label;
      this.dialog.layout();
      flipPlayerCard(this, playerCard, 'front');
    }
  }
}
