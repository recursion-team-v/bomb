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
import { createMapAnims } from '../anims/MapAnims';
import { createTitleBackgroundAnims } from '../anims/TitleBackground';

export default class Preloader extends Phaser.Scene {
  private preloadComplete = false;
  network?: Network;

  constructor() {
    super(Config.SCENE_NAME_PRELOADER);
  }

  preload() {
    // アセットを読み込む前に、ローディングであることを伝えるテキストを表示する
    this.add.text(
      Constants.DEFAULT_WIDTH / 2 - 100,
      Constants.DEFAULT_HEIGHT / 2,
      'Loading game...',
      {
        fontSize: '32px',
        color: '#fff',
      }
    );

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

    this.load.image('cloud', 'assets/cloud.png');

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

    // sprites for map assets
    for (const mapAsset of Object.values(Constants.MAP_ASSETS)) {
      this.load.spritesheet(mapAsset, `assets/map/ground/${mapAsset}.png`, {
        frameWidth,
        frameHeight,
      });
    }

    // sprites for grounds
    for (const groundType of Object.values(Constants.GROUND_TYPES)) {
      this.load.spritesheet(`ground_${groundType}`, `assets/map/ground/ground_${groundType}.png`, {
        frameWidth,
        frameHeight,
      });
    }

    // sprites for block
    this.load.spritesheet(Constants.OBJECT_LABEL.BLOCK, 'assets/map/block.png', {
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

    this.load.image('board', 'assets/board.png');
    this.load.image('child_board', 'assets/child_board.png');
    this.load.image('slider_thumb', 'assets/slider_thumb.png');
    this.load.image('check', 'assets/check.png');
    this.load.image('cross', 'assets/cross.png');
    this.load.image('nameBar', 'assets/nameBar.png');

    // keyboard
    this.load.image('space', 'assets/keyboard/space.png');
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
    this.load.audio('stage', ['assets/bgm/stage.mp3']);
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
      createMapAnims(this.anims);
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
