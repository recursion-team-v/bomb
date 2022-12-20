const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet('player', 'assets/player.png', {
    frameWidth: 48,
    frameHeight: 48,
  });
  this.load.spritesheet('otherPlayer', 'assets/dragon.png', {
    frameWidth: 48,
    frameHeight: 48,
  });
}

function create() {
  const self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });

    // 衝突判定
    self.physics.add.collider(self.player, self.otherPlayers);
  });

  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  this.socket.on('disconnected', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
}

function update() {
  if (this.player) {
    this.physics.world.wrap(this.player, 5);

    // emit player movement
    const x = this.player.x;
    const y = this.player.y;
    const r = this.player.rotation;
    if (
      this.player.oldPosition &&
      (x !== this.player.oldPosition.x ||
        y !== this.player.oldPosition.y ||
        r !== this.player.oldPosition.rotation)
    ) {
      this.socket.emit('playerMovement', {
        x: this.player.x,
        y: this.player.y,
        rotation: this.player.rotation,
      });
    }
    // save old position data
    this.player.oldPosition = {
      x: this.player.x,
      y: this.player.y,
      rotation: this.player.rotation,
    };

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
      this.player.anims.play('up', true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
      this.player.anims.play('down', true);
    } else {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
    }
  }
}

function addPlayer(self, playerInfo) {
  self.player = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, 'player')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40);

  self.anims.create({
    key: 'down',
    frames: self.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
    frameRate: 10,
    repeat: -1,
  });

  self.anims.create({
    key: 'left',
    frames: self.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });

  self.anims.create({
    key: 'right',
    frames: self.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  self.anims.create({
    key: 'up',
    frames: self.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
    frameRate: 10,
    repeat: -1,
  });

  self.player.setDrag(100);
  self.player.setAngularDrag(100);
  self.player.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add
    .sprite(playerInfo.x, playerInfo.y, 'otherPlayer')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
