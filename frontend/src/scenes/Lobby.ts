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
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite';
import Buttons from 'phaser3-rex-plugins/templates/ui/buttons/Buttons';

export interface IAvailableRoom {
  id: string;
  name: string;
  clients: number;
  maxClients: number;
}

export default class Lobby extends Phaser.Scene {
  network!: Network;
  private availableRooms: IAvailableRoom[] = [];
  private buttons?: Buttons;
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
    this.network.onPlayerIsReady((player) => {
      this.handlePlayerIsReady(player);
    });

    this.buttons = createButtons(this, Constants.WIDTH / 2, Constants.HEIGHT / 5, [
      createButton(this, 0, 0, 'Create Room'),
    ]);
    this.buttons.on('button.click', this.handleRoomCreate, this);

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
      this.disableLobbyButtons();
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
      this.disableLobbyButtons();
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
      const dialogContent = this.dialog.getElement('content') as GridSizer;
      const playerCard = dialogContent.getChildren().at(player.idx) as Label;
      playerCard.setText(this.playerName);
      const icon = playerCard.getElement('icon') as ContainerLite;
      icon.getChildren().forEach((child: any, idx) => {
        if (idx === 2) {
          child.setFillStyle(Constants.BLUE);
        }
      });
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
      const icon = playerCard.getElement('icon') as ContainerLite;
      icon.getChildren().forEach((child: any, idx) => {
        if (idx === 2) {
          child.setFillStyle(Constants.RED);
        }
      });
      setTimeout(() => {
        flipPlayerCard(this, playerCard, 'back');
      }, 200);
    }
  }

  private removePlayerCard(player: ServerPlayer) {
    if (this.dialog != null) {
      const dialogContent = this.dialog.getElement('content') as GridSizer;
      const playerCard = dialogContent.getChildren().at(player.idx) as Label;
      const icon = playerCard.getElement('icon') as ContainerLite;
      icon.getChildren().forEach((child: any, idx) => {
        if (idx === 0) {
          child.setFillStyle(0xf87171);
        } else if (idx === 1) {
          child.setText('not ready');
        }
      });
      this.dialog.layout();
      flipPlayerCard(this, playerCard, 'front');
    }
  }

  private handlePlayerIsReady(player: ServerPlayer) {
    if (this.dialog != null) {
      const dialogContent = this.dialog.getElement('content') as GridSizer;
      const playerCard = dialogContent.getChildren().at(player.idx) as Label;
      const icon = playerCard.getElement('icon') as ContainerLite;
      icon.getChildren().forEach((child: any, idx) => {
        if (idx === 0) {
          child.setFillStyle(0xa3e635);
        } else if (idx === 1) {
          child.setText('ready');
        }
      });
    }
  }

  private disableLobbyButtons() {
    this.gridTable?.off('cell.click', this.handleRoomJoin, this);
    this.buttons?.setButtonEnable(false);
  }

  private enableLobbyButtons() {
    this.gridTable?.on('cell.click', this.handleRoomJoin, this);
    this.buttons?.setButtonEnable(true);
  }
}
