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
  private bgm?: Phaser.Sound.BaseSound;
  private se1?: Phaser.Sound.BaseSound;
  private se2?: Phaser.Sound.BaseSound;
  private availableRooms: IAvailableRoom[] = [];
  private buttons?: Buttons;
  private gridTable?: GridTable;
  private dialog?: Dialog;
  private playerName = '';

  constructor() {
    super(Config.SCENE_NAME_LOBBY);
  }

  init() {
    this.se1 = this.sound.add('select', {
      volume: Config.SOUND_VOLUME,
    });
    this.se2 = this.sound.add('select1', {
      volume: Config.SOUND_VOLUME,
    });
  }

  create(data: { network: Network; playerName: string; bgm: Phaser.Sound.BaseSound }) {
    if (data.network === undefined) {
      throw new Error('server instance missing');
    } else {
      this.network = data.network;
    }
    this.bgm = data.bgm;
    this.playerName = data.playerName;

    this.availableRooms = this.getAvailableRooms();
    this.network.onRoomsUpdated(this.handleRoomsUpdated, this);
    this.network.onGameStartInfo(async (data: IGameStartInfo) => {
      await this.handleGameStart(data);
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
    this.network.onPlayerJoinedRoom(this.addOtherPlayerCard, this);
    this.network.onPlayerLeftRoom(this.removePlayerCard, this);
    this.network.onPlayerIsReady((player) => {
      this.handlePlayerIsReady(player);
    });

    this.buttons = createButtons(this, Constants.WIDTH / 2, Constants.HEIGHT / 5, [
      createButton(this, 'create room', Constants.GREEN),
    ]);
    this.buttons.on('button.click', this.handleRoomCreate, this);

    this.gridTable = createGridTable(this, this.availableRooms);
    this.gridTable.on('cell.click', this.handleRoomJoin, this);
  }

  private getAvailableRooms() {
    const availableRooms: IAvailableRoom[] = [];
    for (const room of this.network.allRooms) {
      if (room.metadata?.locked === false) {
        availableRooms.push({
          id: room.roomId,
          name: room.metadata?.name,
          clients: room.clients,
          maxClients: room.maxClients,
        });
      }
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
    if (this.dialog === undefined) {
      this.se1?.play();
      this.disableLobbyButtons();
      await this.network.createAndJoinCustomRoom({
        name: this.playerName,
        password: null,
        autoDispose: true,
        playerName: this.playerName,
      });
      this.dialog = createDialog(
        this,
        Constants.WIDTH / 2,
        Constants.HEIGHT / 2,
        () => this.onDialogReady(),
        () => this.onDialogClose()
      );
    }
  }

  private async handleRoomJoin(cellContainer: any, cellIndex: number) {
    if (cellIndex === -1 || cellIndex >= this.availableRooms.length) return;
    if (this.network.room !== undefined) {
      await this.network.room.leave();
    }
    const room = this.availableRooms[cellIndex];
    if (this.dialog === undefined) {
      this.se1?.play();
      this.disableLobbyButtons();
      await this.network.joinCustomRoom(room.id, null, this.playerName);
      this.dialog = createDialog(
        this,
        Constants.WIDTH / 2,
        Constants.HEIGHT / 2,
        () => this.onDialogReady(),
        () => this.onDialogClose()
      );
    }
  }

  private async handleGameStart(data: IGameStartInfo) {
    this.bgm?.stop();
    this.network.removeOnPlayerJoinedRoom();
    this.network.removeOnPlayerLeftRoom();
    await this.network.lobby?.leave();
    const { serverTimer } = data;
    this.scene.start(Config.SCENE_NAME_GAME, { network: this.network, serverTimer });
    this.scene.start(Config.SCENE_NAME_GAME_HEADER, { network: this.network, serverTimer });
  }

  private addMyPlayerCard(player: ServerPlayer) {
    if (this.dialog !== undefined) {
      this.se2?.play();
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
    if (this.dialog !== undefined) {
      this.se2?.play();
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
    if (this.dialog !== undefined) {
      const dialogContent = this.dialog.getElement('content') as GridSizer;
      const playerCard = dialogContent.getChildren().at(player.idx) as Label;
      const icon = playerCard.getElement('icon') as ContainerLite;
      icon.getChildren().forEach((child: any, idx) => {
        if (idx === 0) {
          child.setFillStyle(Constants.LIGHT_RED);
        } else if (idx === 1) {
          child.setText('not ready');
        }
      });
      this.dialog.layout();
      flipPlayerCard(this, playerCard, 'front');
    }
  }

  private handlePlayerIsReady(player: ServerPlayer) {
    if (this.dialog !== undefined) {
      const dialogContent = this.dialog.getElement('content') as GridSizer;
      const playerCard = dialogContent.getChildren().at(player.idx) as Label;
      const icon = playerCard.getElement('icon') as ContainerLite;
      icon.getChildren().forEach((child: any, idx) => {
        if (idx === 0) {
          child.setFillStyle(Constants.GREEN);
        } else if (idx === 1) {
          child.setText('ready');
        }
      });
    }
  }

  private onDialogReady() {
    this.se1?.play();
    this.network.sendPlayerGameState(Constants.PLAYER_GAME_STATE.READY);
  }

  private onDialogClose() {
    this.se1?.play();
    this.dialog
      ?.scaleDownDestroyPromise(100)
      .then(async () => {
        this.dialog = undefined;
        await this.network.leaveRoom();
        this.enableLobbyButtons();
      })
      .catch((err) => console.log(err));
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
