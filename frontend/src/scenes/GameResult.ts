import Phaser from 'phaser';
import * as Constants from '../../../backend/src/constants/constants';
import * as Config from '../config/config';
import ServerGameResult from '../../../backend/src/rooms/schema/GameResult';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import phaserJuice from '../lib/phaserJuice';

export default class GameResult extends Phaser.Scene {
  private readonly juice: phaserJuice;
  constructor() {
    super(Config.SCENE_NAME_GAME_RESULT);
    // eslint-disable-next-line new-cap
    this.juice = new phaserJuice(this);
  }

  create(data: { sessionId: string; gameResult: ServerGameResult }) {
    this.cameras.main.setSize(Constants.WIDTH, Constants.HEIGHT);

    this.add.image(
      Constants.WIDTH * 0.5,
      Constants.HEIGHT * 0.15,
      this.getResultKey(data.gameResult)
    );

    const winner = this.getWinner(data.gameResult);
    // const players = this.getPlayers(data.gameResult);
    // テスト用
    const players = [
      {
        sessionId: 'test',
        name: 'tanakaaaaaa',
      },
      {
        sessionId: 'test2',
        name: 'tanaka2',
      },
      {
        sessionId: 'test3',
        name: 'tanaka3',
      },
    ];

    // 勝利者がいる場合
    if (winner !== '') {
      const cup = this.add.image(
        Constants.WIDTH * 0.25,
        Constants.HEIGHT * 0.4,
        Config.ASSET_KEY_WINNER_CUP
      );

      setInterval(() => {
        this.juice.flash(cup);
      }, 100);

      this.add
        .sprite(Constants.WIDTH * 0.25, Constants.HEIGHT * 0.58, Config.ASSET_KEY_PLAYER, 14)
        .play('player_down')
        .setScale(1.5);
      this.add
        .text(Constants.WIDTH * 0.25, Constants.HEIGHT * 0.7, winner, {
          fontSize: '40px',
          fontStyle: 'bold',
          align: 'center',
        })
        .setOrigin(0.5);

      for (let i = 0; i < players.length; i++) {
        if (players[i].sessionId === data.sessionId) continue;
        this.generatePlayerContainer(
          Constants.WIDTH * 0.6,
          Constants.HEIGHT * 0.4 + 150 * i,
          players[i].name,
          Config.ASSET_KEY_PLAYER
        );
      }
    } else {
      for (let i = 0; i < players.length; i++) {
        this.generatePlayerContainer(
          Constants.WIDTH * 0.15 + 450 * (i % 2 === 0 ? 0 : 1),
          Constants.HEIGHT * 0.4 + 300 * (i % 2 === 0 ? Math.round(i / 2) : Math.round(i / 2) - 1),
          players[i].name,
          Config.ASSET_KEY_PLAYER
        );
      }
    }

    const button = this.add
      .container(Constants.WIDTH * 0.6, Constants.HEIGHT * 0.9, [
        this.add.graphics().fillStyle(0xcdcdcd, 1).fillRoundedRect(0, 0, 260, 50, 5),
        this.add
          .text(130, 25, 'Go to Lobby', {
            color: '#000000',
            fontSize: '32px',
            align: 'center',
          })
          .setOrigin(0.5),
      ])
      .setInteractive();

    // FIXME: ここでロビーに遷移する処理を追加する
    button.on('pointerup', () => {});
  }

  generatePlayerContainer(x: number, y: number, name: string, assetKey: string) {
    this.add.container(x, y, [
      this.add.sprite(0, 0, assetKey, 14).setScale(1.2),
      this.add.text(200, 0, name, { fontSize: '32px', align: 'center' }).setOrigin(0.5),
      this.add.line(30, 0, 100, 50, 500, 50, 0xffffff),
    ]);
  }

  getPlayers(data: any): ServerPlayer[] {
    for (let i = 0; i < data.length; i++) {
      if (data[i].field === 'players') return data[i].value;
    }

    return [];
  }

  getResultKey(data: any): string {
    let result = 0 as Constants.GAME_RESULT_TYPE;
    for (let i = 0; i < data.length; i++) {
      if (data[i].field === 'result') result = data[i].value;
    }

    if (result === Constants.GAME_RESULT.WIN) return Config.ASSET_KEY_WINNER;
    return Config.ASSET_KEY_DRAW_GAME;
  }

  getWinner(data: any): string {
    for (let i = 0; i < data.length; i++) {
      if (data[i].field === 'winner') return data[i].value.name;
    }

    return '';
  }
}
