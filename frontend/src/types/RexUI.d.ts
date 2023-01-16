import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

export {};

declare global {
  namespace Phaser {
    interface Scene {
      rexUI: RexUIPlugin;
    }
  }
}
