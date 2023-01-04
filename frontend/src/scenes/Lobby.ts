import Dialog from 'phaser3-rex-plugins/templates/ui/dialog/Dialog';
import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';
import Network from '../services/Network';
import { createButton, createDialog } from '../utils/ui';

export default class Lobby extends Phaser.Scene {
  network!: Network;
  lobbyPlayers = new Map<string, Phaser.GameObjects.Sprite>();
  private dialog?: Dialog;

  constructor() {
    super(Config.SCENE_NAME_LOBBY);
  }

  create(data: { network: Network }) {
    if (data.network == null) {
      throw new Error('server instance missing');
    } else {
      this.network = data.network;
    }

    this.network.onPlayerJoinedRoom(() => this.handlePlayerJoinedRoom());
    this.network.onPlayerLeftRoom((_, sessionId) => this.handlePlayerLeftRoom(sessionId));

    const buttons = this.rexUI.add
      .buttons({
        x: Constants.WIDTH / 2,
        y: Constants.HEIGHT / 2,
        orientation: 'y',
        buttons: [createButton(this, 0, 0, 'Join/Create Room!')],
      })
      .layout();

    buttons.on('button.click', async () => {
      if (this.dialog == null) {
        await this.network.joinOrCreateRoom();
        this.dialog = createDialog(this, Constants.WIDTH / 2, Constants.HEIGHT / 2, () =>
          this.handleGameStart()
        );
      }
    });
  }

  private handleGameStart() {
    this.scene.start(Config.SCENE_NAME_GAME, {
      network: this.network,
    });
    this.scene.start(Config.SCENE_NAME_GAME_HEADER);
  }

  // FIXME: bad implementation
  private handlePlayerJoinedRoom() {
    const currRoom = this.network.room;
    if (currRoom != null) {
      let i = currRoom.state.players.size;
      currRoom.state.players.forEach((player, sessionId) => {
        if (!this.lobbyPlayers.has(sessionId)) {
          i--;
          this.lobbyPlayers.set(
            sessionId,
            this.add.sprite(200 + 100 * i, 400, 'player').play('player_down')
          );
        }
      });
    }
  }

  private handlePlayerLeftRoom(sessionId: string) {
    const sprite = this.lobbyPlayers.get(sessionId);
    sprite?.destroy();
    this.lobbyPlayers.delete(sessionId);
  }
}
