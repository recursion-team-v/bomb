import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import ServerGameResult from '../../../backend/src/rooms/schema/GameResult';
import ServerPlayer from '../../../backend/src/rooms/schema/Player';
import * as Config from '../config/config';
import phaserJuice from '../lib/phaserJuice';
import Network from '../services/Network';
import { getWinner } from '../utils/result';
import { createButton, createButtons } from '../utils/ui';
import { addBackground } from '../utils/title';
import { isPlay } from '../utils/sound';

export default class GameResult extends Phaser.Scene {
  private network!: Network;
  private se1?: Phaser.Sound.BaseSound;
  private bgm!: Phaser.Sound.BaseSound;
  private readonly juice: phaserJuice;

  constructor() {
    super(Config.SCENE_NAME_GAME_RESULT);
    // eslint-disable-next-line new-cap
    this.juice = new phaserJuice(this);
  }

  init() {
    this.se1 = this.sound.add('select', {
      volume: Config.SOUND_VOLUME,
    });
    this.bgm = this.sound.add('result', {
      volume: Config.SOUND_VOLUME,
    });
    this.bgm.play({
      loop: true,
    });
  }

  create(data: {
    network: Network;
    playerName: string;
    sessionId: string;
    gameResult: ServerGameResult;
  }) {
    if (data.network == null) return;
    this.network = data.network;
    this.cameras.main.setSize(Constants.WIDTH, Constants.HEIGHT);

    // 舞台幕を開ける
    this.add
      .sprite(0, 0, 'curtain_open')
      .setOrigin(0, 0)
      .setScale(1.5, 2)
      .setDepth(1000)
      .play({ key: Config.CURTAIN_OPEN_ANIMATION_KEY, hideOnComplete: true }, true);

    addBackground(this);

    // タイトルを表示
    this.add.image(
      Constants.WIDTH * 0.5,
      Constants.HEIGHT * 0.1,
      this.getResultKey(data.gameResult)
    );

    // ボリュームアイコンを表示
    this.add.volumeIcon(this, Constants.WIDTH - 100, 10, isPlay());

    const winner = getWinner(data.gameResult);
    const players = this.getPlayers(data.gameResult);

    // テスト用
    // const players = [
    //   {
    //     sessionId: 'test',
    //     name: 'tanakaaaaaa',
    //   },
    //   {
    //     sessionId: 'test2',
    //     name: 'tanaka2',
    //   },
    //   {
    //     sessionId: 'test3',
    //     name: 'tanaka3',
    //   },
    // ];

    // 勝利者がいる場合
    if (winner !== undefined) {
      // 花火を表示
      this.addFireWorks();

      this.add
        .rectangle(
          Constants.WIDTH * 0.02,
          200,
          Constants.WIDTH * 0.96,
          Constants.HEIGHT * 0.73,
          Constants.LIGHT_GRAY,
          0.5
        )
        .setOrigin(0, 0);

      // トロフィーを表示
      this.add
        .sprite(Constants.WIDTH * 0.25, Constants.HEIGHT * 0.38, Config.ASSET_KEY_TROPHY)
        .play({ key: Config.TROPHY_ANIMATION_KEY }, true);

      this.add
        .sprite(Constants.WIDTH * 0.25, Constants.HEIGHT * 0.58, winner.character, 14)
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .play(`${winner.character}_down`)
        .setScale(2.5);
      this.add
        .text(Constants.WIDTH * 0.25, Constants.HEIGHT * 0.75, winner.name, {
          fontSize: '40px',
          fontStyle: 'bold',
          align: 'center',
          fontFamily: 'PressStart2P',
        })
        .setOrigin(0.5);

      // y軸でfor文のiを参照すると勝者のiが一つ分飛ぶことになるので間隔ができてしまうので、別で敗者の時にインクリメントする変数を定義
      let index = 0;
      for (let i = 0; i < players.length; i++) {
        if (players[i].hp > 0) continue;
        this.generatePlayerContainer(
          Constants.WIDTH * 0.6,
          Constants.HEIGHT * 0.4 + 150 * index,
          players[i].name,
          players[i].character
        );
        index++;
      }
    } else {
      for (let i = 0; i < players.length; i++) {
        this.generatePlayerContainer(
          Constants.WIDTH * 0.15 + 450 * (i % 2 === 0 ? 0 : 1),
          Constants.HEIGHT * 0.4 + 300 * (i % 2 === 0 ? Math.round(i / 2) : Math.round(i / 2) - 1),
          players[i].name,
          players[i].character
        );
      }
    }

    const buttons = createButtons(this, Constants.WIDTH * 0.8, Constants.HEIGHT * 0.9, [
      createButton(this, 'Go to Lobby', Constants.LIGHT_RED),
    ]);
    buttons.on(
      'button.click',
      async () => {
        this.se1?.play();
        await this.network.joinLobbyRoom();
        this.bgm.stop();
        this.scene.get(Config.SCENE_NAME_GAME).scene.stop(); // ゲームシーンを shutdown する
        this.scene.stop();
        this.scene.start(Config.SCENE_NAME_LOBBY, {
          network: this.network,
          playerName: data.playerName,
        });
      },
      this
    );
  }

  generatePlayerContainer(x: number, y: number, name: string, character: string) {
    this.add.container(x, y, [
      this.add.sprite(0, 0, character, 14).setScale(1.2).play(`${character}_death_down`),
      this.add
        .text(200, 0, name, { fontSize: '32px', align: 'center', fontFamily: 'PressStart2P' })
        .setOrigin(0.5),
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

  addFireWorks() {
    const particles = this.add.particles('flares');
    const emitterConfig = {
      alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
      angle: { start: 0, end: 360, steps: 100 },
      blendMode: 'ADD',
      frame: { frames: ['red', 'yellow', 'green', 'blue'], cycle: true, quantity: 500 },
      frequency: 2000,
      gravityY: 300,
      lifespan: 1000,
      quantity: 700,
      reserve: 500,
      scale: { min: 0.05, max: 0.15 },
      speed: { min: 10, max: 600 },
      x: 512,
      y: 384,
    };
    const emitter = particles.createEmitter(emitterConfig);
    const { width, height } = this.scale;
    const { FloatBetween } = Phaser.Math;

    this.time.addEvent({
      delay: 1000,
      startAt: 1000,
      repeat: -1,
      callback: () => {
        emitter.setPosition(width * FloatBetween(0.25, 0.75), height * FloatBetween(0, 0.5));
      },
    });
  }
}
