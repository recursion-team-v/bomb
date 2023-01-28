import Phaser from 'phaser';

import * as Constants from '../../../backend/src/constants/constants';
import { createBombAnims, createPenetrationBombAnims } from '../anims/BombAnims';
import { createCharacterAnims } from '../anims/CharacterAnims';
import { createExplodeAnims, createPenetrationExplodeAnims } from '../anims/explodeAnims';
import { createTrophyAnims } from '../anims/TrophyAnims';
import { createCurtainOpenAnims } from '../anims/CurtainAnims';
import * as Config from '../config/config';
import Network from '../services/Network';
import isMobile from '../utils/mobile';
import { createTitleBackgroundAnims } from '../anims/TitleBackground';

export default class Preloader extends Phaser.Scene {
  private preloadComplete = false;
  network?: Network;

  constructor() {
    super(Config.SCENE_NAME_PRELOADER);
  }

  preload() {
    // アセットを読み込む前に、ローディングであることを伝えるテキストを表示する
    this.add.text(Constants.WIDTH / 2 - 100, Constants.HEIGHT / 2, 'Loading game...', {
      fontSize: '32px',
      color: '#fff',
    });

    this.load.spritesheet(Config.ASSET_KEY_TITLE_BACKGROUND, 'assets/title_background.png', {
      frameWidth: 800,
      frameHeight: 720,
    });

    const frameWidth = Constants.DEFAULT_TIP_SIZE;
    const frameHeight = Constants.DEFAULT_TIP_SIZE;

    for (const character of Constants.CHARACTERS) {
      this.load.spritesheet(character, `assets/characters/${character}.png`, {
        frameWidth,
        frameHeight,
      });
    }

    this.load.spritesheet('bomb', 'assets/items/bomb/bomb.png', {
      frameWidth,
      frameHeight,
    });

    this.load.spritesheet('penetration_bomb', 'assets/items/bomb/penetration_bomb.png', {
      frameWidth,
      frameHeight,
    });

    this.load.spritesheet('bomb_center_blast', 'assets/items/bomb/center_blast.png', {
      frameWidth,
      frameHeight,
    });

    this.load.spritesheet(
      'penetration_bomb_center_blast',
      'assets/items/bomb/center_blast_penetration.png',
      {
        frameWidth,
        frameHeight,
      }
    );

    this.load.spritesheet('bomb_horizontal_blast', 'assets/items/bomb/horizontal_blast.png', {
      frameWidth,
      frameHeight,
    });

    this.load.spritesheet(
      'penetration_bomb_horizontal_blast',
      'assets/items/bomb/horizontal_blast_penetration.png',
      {
        frameWidth,
        frameHeight,
      }
    );

    this.load.spritesheet(
      'bomb_horizontal_end_blast',
      'assets/items/bomb/horizontal_end_blast.png',
      {
        frameWidth,
        frameHeight,
      }
    );

    this.load.image('bomb_point', 'assets/items/bomb/bomb_point.png');
    this.load.image('penetration_bomb_point', 'assets/items/bomb/bomb_point_penetration.png');

    this.load.spritesheet(
      'penetration_bomb_horizontal_end_blast',
      'assets/items/bomb/horizontal_end_blast_penetration.png',
      {
        frameWidth,
        frameHeight,
      }
    );

    // tile sheet for ground
    this.load.image('tile_grounds', 'assets/tile_grounds.png');

    // sprites for outer/inner wall
    this.load.spritesheet(Constants.OBJECT_LABEL.WALL, 'assets/tile_walls.png', {
      frameWidth,
      frameHeight,
    });

    // sprites for block
    this.load.spritesheet(Constants.OBJECT_LABEL.BLOCK, 'assets/tile_walls.png', {
      frameWidth,
      frameHeight,
    });

    // sprites for items
    this.load.image(Constants.ITEM_TYPE.BOMB_POSSESSION_UP, 'assets/items/item_bomb_up.png');
    this.load.image(Constants.ITEM_TYPE.BOMB_STRENGTH, 'assets/items/item_bomb_strength.png');
    this.load.image(Constants.ITEM_TYPE.PLAYER_SPEED, 'assets/items/item_player_speed.png');
    this.load.image(Constants.ITEM_TYPE.HEART, 'assets/items/item_heart.png');
    this.load.image(Constants.ITEM_TYPE.PENETRATION_BOMB, 'assets/items/item_penetration_bomb.png');

    // icon
    this.load.image(Config.ASSET_KEY_VOLUME_ON, 'assets/icons/volume_on.png');
    this.load.image(Config.ASSET_KEY_VOLUME_OFF, 'assets/icons/volume_off.png');

    // game result assets
    this.load.image(Config.ASSET_KEY_WINNER, 'assets/winner.png');
    this.load.image(Config.ASSET_KEY_DRAW_GAME, 'assets/draw_game.png');

    if (isMobile()) {
      this.load.image(Constants.JOYSTICK_BASE_KEY, 'assets/joystick-base.png');
      this.load.image(Constants.JOYSTICK_STICK_KEY, 'assets/joystick-red.png');
    }

    // title
    this.load.image('title', 'assets/title.png');

    // stage curtain
    this.load.spritesheet(Config.ASSET_KEY_CURTAIN_OPEN, 'assets/stage_curtain.png', {
      frameWidth: 640,
      frameHeight: 480,
    });

    this.load.spritesheet(Config.ASSET_KEY_TROPHY, 'assets/trophy.png', {
      frameWidth: 192,
      frameHeight: 192,
    });

    // flares
    this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');

    // usage
    this.load.spritesheet('keyboard', 'assets/keyboard.png', {
      frameWidth,
      frameHeight,
    });

    // keyboard
    this.load.image('leftSpace', 'assets/keyboard/space_left.png');
    this.load.image('rightSpace', 'assets/keyboard/space_right.png');
    this.load.image('centerSpace', 'assets/keyboard/space_center.png');

    this.load.image('left', 'assets/keyboard/left.png');
    this.load.image('right', 'assets/keyboard/right.png');
    this.load.image('top', 'assets/keyboard/top.png');
    this.load.image('down', 'assets/keyboard/down.png');

    this.load.image(Config.ASSET_KEY_BATTLE_START_UP, 'assets/battle_start_up.png');
    this.load.image(Config.ASSET_KEY_BATTLE_START_DOWN, 'assets/battle_start_down.png');

    this.load.audio('bombExplode', ['assets/se/bomb.mp3']);
    this.load.audio('getItem', ['assets/se/get_item.mp3']);
    this.load.audio('hitPlayer', ['assets/se/hit_player.mp3']);
    this.load.audio('battleStart', ['assets/bgm/battle_start.mp3']);
    this.load.audio('select', ['assets/se/select.mp3']);
    this.load.audio('select1', ['assets/se/select1.mp3']);
    this.load.audio('stage_1', ['assets/bgm/stage_1.mp3']);
    this.load.audio('stage_2', ['assets/bgm/stage_2.mp3']);
    this.load.audio('opening', ['assets/bgm/opening.mp3']);
    this.load.audio('result', ['assets/bgm/result.mp3']);
    this.load.audio('win', ['assets/bgm/win.mp3']);
    this.load.audio('lose', ['assets/bgm/lose.mp3']);
    this.load.audio('drow', ['assets/bgm/drow.mp3']);

    this.load.on('complete', () => {
      createTitleBackgroundAnims(this.anims);
      createBombAnims(this.anims);
      createPenetrationBombAnims(this.anims);
      createExplodeAnims(this.anims);
      createPenetrationExplodeAnims(this.anims);
      createCurtainOpenAnims(this.anims);
      createTrophyAnims(this.anims);
      createCharacterAnims(this.anims);
      this.preloadComplete = true;
    });
  }

  init() {
    this.network = new Network();
  }

  update() {
    if (!this.preloadComplete) return;

    this.scene.start(Config.SCENE_NAME_TITLE, {
      network: this.network,
    });
  }
}
