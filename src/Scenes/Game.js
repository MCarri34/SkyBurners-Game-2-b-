class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('player', 'assets/ship_0001.png');
        this.load.image('enemy1', 'assets/ship_0007.png');
        this.load.image('enemy2', 'assets/ship_0003.png');
        this.load.image('bullet', 'assets/tile_0000.png');
        this.load.image('enemyBullet', 'assets/tile_0002.png');
        this.load.image('bomb', 'assets/tile_0006.png');
        this.load.audio('laser1', 'assets/laser1.ogg');
        this.load.audio('laser3', 'assets/laser3.ogg');
        this.load.bitmapFont('arcade', 'assets/arcade.png', 'assets/arcade.xml');
    }

    create() {
        this.initGame();
    }

    initGame() {
        this.score = 0;
        this.lives = 5;
        this.level = 1;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.player = this.physics.add.sprite(500, 700, 'player').setScale(3).setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 20 });
        this.enemyBullets = this.physics.add.group({ defaultKey: 'enemyBullet', maxSize: 50 });

        this.enemies = this.physics.add.group();
        this.spawnEnemies();

        this.scoreText = this.add.bitmapText(16, 16, 'arcade', 'Score: 0', 20);
        this.livesText = this.add.bitmapText(700, 16, 'arcade', 'Health: 5', 20);
        this.levelText = this.add.bitmapText(350, 16, 'arcade', 'Level: 1', 20);

        this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.collider(this.enemyBullets, this.player, this.playerHit, null, this);

        this.physics.world.on('worldbounds', body => {
            if (body.gameObject) body.gameObject.disableBody(true, true);
        });

        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: this.enemyShoot,
            callbackScope: this
        });
    }

    spawnEnemies() {
        const enemyCount = 4 + this.level * 2;
        for (let i = 0; i < enemyCount; i++) {
            let texture = this.level % 2 === 0 || i % 2 === 0 ? 'enemy2' : 'enemy1';
            let x = 100 + (i % 5) * 160;
            let y = 100 + Math.floor(i / 5) * 80;
            let enemy = this.enemies.create(x, y, texture);
            enemy.setScale(2.5);
            enemy.enemyType = texture;

            if (texture === 'enemy2') {
                // angled downward path with bounce away from player when close
                enemy.setVelocity(50, 50);
                enemy.setCollideWorldBounds(true);
                enemy.setBounce(1, 1);

                enemy.update = () => {
                    if (enemy.body && enemy.body.velocity && enemy.y >= this.player.y - 100 && enemy.body.velocity.y > 0) {
                        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                        const bounceSpeed = 200;
                        enemy.setVelocity(
                            -Math.cos(angle) * bounceSpeed,
                            -Math.sin(angle) * bounceSpeed
                        );
                    }
                };

                this.events.on('update', enemy.update, enemy);
            } else {
                // side to side motion for enemy1
                this.tweens.add({
                    targets: enemy,
                    x: enemy.x + 100,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }

    enemyShoot() {
        // Only allow specific enemy types to shoot specific projectiles
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                // Determine bullet type based on exact texture
                let type = (enemy.texture.key === 'enemy2') ? 'bomb' : (enemy.texture.key === 'enemy1' ? 'enemyBullet' : null);
                let shot = this.enemyBullets.get(enemy.x, enemy.y + 20, type);
                if (type && shot) {
                    shot.setScale(1.5);
                    shot.setActive(true).setVisible(true);
                    shot.body.enable = true;
                    shot.setCollideWorldBounds(true);
                    shot.body.onWorldBounds = true;
                    if (type === 'bomb') {
                        shot.setVelocity(Phaser.Math.Between(-50, 50), 250);
                    } else {
                        shot.setVelocityY(200);
                    }
                    this.sound.play('laser3', { volume: 0.3 });
                }
            }
        });
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.fireButton)) {
            const bullet = this.bullets.get(this.player.x, this.player.y - 20);
            if (bullet) {
                bullet.setScale(1.5);
                bullet.setActive(true).setVisible(true);
                bullet.body.enable = true;
                bullet.setCollideWorldBounds(true);
                bullet.body.onWorldBounds = true;
                bullet.setVelocityY(-300);
                this.sound.play('laser1');
            }
        }

        this.scoreText.setText('Score: ' + this.score);
        this.livesText.setText('Health: ' + this.lives);
        this.levelText.setText('Level: ' + this.level);

        if (this.enemies.countActive(true) === 0) {
            this.level++;
            this.spawnEnemies();
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.disableBody(true, true);
        enemy.disableBody(true, true);
        this.score += enemy.texture.key === 'enemy2' ? 200 : 100;    
    }

    playerHit(player, bullet) {
        if (this.player.invincible) {
            bullet.disableBody(true, true);
            return;
        }

        bullet.disableBody(true, true);
        const isBomb = bullet.texture.key === 'bomb';
        this.lives -= isBomb ? 2 : 1;
        this.player.invincible = true;

        this.tweens.add({
            targets: this.player,
            alpha: 0,
            ease: 'Linear',
            duration: 100,
            repeat: 10,
            yoyo: true,
            onComplete: () => {
                this.player.alpha = 1;
                this.player.invincible = false;
            }
        });

        if (this.lives <= 0) {
            if (this.score > this.highScore) {
                localStorage.setItem('highScore', this.score);
            }
            this.scene.start('GameOverScene', { score: this.score, highScore: this.highScore });
        }
    }
}

class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        this.load.bitmapFont('arcade', 'assets/arcade.png', 'assets/arcade.xml');
    }

    create() {
        this.add.bitmapText(500, 300, 'arcade', 'SKY BURNERS', 64).setOrigin(0.5);
        this.add.bitmapText(500, 400, 'arcade', 'Press ENTER to Start', 32).setOrigin(0.5);
        this.add.bitmapText(500, 450, 'arcade', 'Press C for Credits', 24).setOrigin(0.5);
        this.add.bitmapText(500, 480, 'arcade', 'Press X for Controls', 24).setOrigin(0.5);

        this.input.keyboard.once('keydown-C', () => {
            this.scene.start('CreditsScene');
        });
        this.input.keyboard.once('keydown-X', () => {
            this.scene.start('ControlsScene');
        });

        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('GameScene');
        });
    }
}

class ControlsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ControlsScene' });
    }

    create() {
        this.add.bitmapText(500, 200, 'arcade', 'CONTROLS', 48).setOrigin(0.5);
        this.add.bitmapText(500, 300, 'arcade', 'Arrow Keys: Move Left & Right', 24).setOrigin(0.5);
        this.add.bitmapText(500, 340, 'arcade', 'SPACE: Fire', 24).setOrigin(0.5);
        this.add.bitmapText(500, 500, 'arcade', 'Press ESC to return', 20).setOrigin(0.5);

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('TitleScene');
        });
    }
}


class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreditsScene' });
    }

    create() {
        this.add.bitmapText(500, 200, 'arcade', 'CREDITS', 48).setOrigin(0.5);
        this.add.bitmapText(500, 300, 'arcade', 'Created by Michael Carrillo', 24).setOrigin(0.5);
        this.add.bitmapText(500, 340, 'arcade', 'Assets & Audio from kenney.nl', 24).setOrigin(0.5);
        this.add.bitmapText(500, 380, 'arcade', 'Font: arcadeclassic by The Dot Studio', 24).setOrigin(0.5);
        this.add.bitmapText(500, 500, 'arcade', 'Press ESC to return', 20).setOrigin(0.5);

        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('TitleScene');
        });
    }
}


class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score;
        this.highScore = data.highScore;
    }

    create() {
        this.add.bitmapText(500, 250, 'arcade', 'GAME OVER', 64).setOrigin(0.5);
        this.add.bitmapText(500, 350, 'arcade', `Score: ${this.finalScore}`, 32).setOrigin(0.5);
        this.add.bitmapText(500, 400, 'arcade', `High Score: ${this.highScore}`, 32).setOrigin(0.5);
        this.add.bitmapText(500, 500, 'arcade', 'Press ENTER to Restart', 24).setOrigin(0.5);

        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('TitleScene');
        });
    }
}

export { GameScene, TitleScene, GameOverScene, CreditsScene, ControlsScene };