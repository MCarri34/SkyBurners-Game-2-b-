# Sky Burners

## Game Overview

- Navigate left and right using the arrow keys
- Press `SPACE` to fire bullets
- Avoid enemy bullets and bombs
- Defeat all enemies to advance to the next level
- Your goal: survive as long as you can while chasing the highest score

## Features Checklist

| Feature                                                                                 | Implemented   |
|-----------------------------------------------------------------------------------------|-------------- |
| JavaScript using Phaser game framework                                                  | YES           |
| Uses multiple Phaser `Scene` classes (`GameScene`, `TitleScene`, `ControlsScene`, etc.) | YES           |
| Keyboard input (arrow keys + space + shortcuts)                                         | YEs           |
| Off-the-shelf art and audio assets from [kenney.nl] (https://kenney.nl)                 | YES           |
| Group-based game object handling (`this.physics.add.group(...)`)                        | YES           |
| Collision detection using loop-based checks between groups                              | YES           |
| End game state (`GameOverScene`) with high score display                                | YES           |
| Game can be restarted without refreshing the browser                                    | YES           |
| **Multiple Levels**: Enemy count increases with each level                              | YES           |
| **High Score**: Saved across play sessions using `localStorage`                         | YES           |
| **Title Screen**: With navigation instructions and scene transitions                    | YES           |
| **Controls/Credits Screens**: Accessible from the title screen using `X` and `C` keys   | YES           |

## Additional Mechanics

- **Invincibility Frames**: After getting hit, the player flashes briefly and is invincible for a few seconds.
- **Bomb Damage**: Planes can drop bombs that deal 2x damage.
- **Enemy Behavior**:
  - `ship_0007.png` enemies move side-to-side and shoot bullets
  - `ship_0003.png` bombers approach diagonally and bounce back when too close

## Controls

| Action        | Key         |
|---------------|-------------|
| Move Left     | ← Arrow     |
| Move Right    | → Arrow     |
| Fire Bullet   | SPACE       |
| Start Game    | ENTER       |
| View Controls | X           |
| View Credits  | C           |
| Return        | ESC         |

## Credits

- **Created by**: Michael Carrillo
- **Assets & Audio**: [kenney.nl](https://kenney.nl)
- **Font**: "arcadeclassic" by The Dot Studio
