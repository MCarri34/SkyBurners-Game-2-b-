import { GameScene, TitleScene, GameOverScene, CreditsScene, ControlsScene } from './Scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 800,
    parent: 'phaser-game',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [TitleScene, GameScene, GameOverScene, CreditsScene, ControlsScene ]
};

new Phaser.Game(config);
