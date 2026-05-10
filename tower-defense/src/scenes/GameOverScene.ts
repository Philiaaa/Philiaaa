import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, C } from '../config';
import { GameState } from '../types';
import { loadMeta } from '../systems/MetaProgression';

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  create(data: { gameState: GameState; victory: boolean; kills?: number }): void {
    const { gameState, victory, kills = 0 } = data;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, victory ? 0x0d2200 : 0x1a0000, victory ? 0x0d2200 : 0x1a0000, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Main title
    const titleColor = victory ? '#2ecc71' : '#ff4757';
    const title = victory ? 'VICTOIRE !' : 'NEXUS DÉTRUIT';
    this.add.text(cx, cy - 120, title, {
      fontSize: '48px', fontStyle: 'bold', color: titleColor,
      stroke: '#000000', strokeThickness: 6,
      shadow: { blur: 20, color: titleColor, fill: true },
    }).setOrigin(0.5);

    const sub = victory
      ? 'Vous avez repoussé tous les envahisseurs !'
      : 'Le Nexus est tombé sous les assauts ennemis.';
    this.add.text(cx, cy - 68, sub, {
      fontSize: '15px', color: '#aaaacc', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Stats panel
    const meta = loadMeta();
    const panelW = 420;
    const panelH = 220;
    this.add.rectangle(cx, cy + 30, panelW, panelH, 0x111128, 0.9)
      .setStrokeStyle(2, 0x2a3a6e, 1);

    const stats = [
      [`Vagues survécues`, `${gameState.wave}  (meilleur : ${meta.bestWave})`],
      [`Ennemis éliminés`, `${kills}`],
      [`Score`, `${gameState.score.toLocaleString()}`],
      [`Améliorations choisies`, `${gameState.appliedUpgrades.length}`],
      [`Total de parties`, `${meta.totalRuns}`],
      [`Total kills global`, `${meta.totalKills}`],
    ];

    stats.forEach(([label, value], i) => {
      const rowY = cy - 60 + i * 32;
      this.add.text(cx - 190, rowY, label, { fontSize: '13px', color: '#8888aa' }).setOrigin(0, 0.5);
      this.add.text(cx + 190, rowY, value, { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(1, 0.5);
    });

    // Buttons
    this.makeButton(cx - 110, cy + 130, 180, 46, 'REJOUER', C.btnGreen, () => {
      this.scene.start('ClassSelectScene');
    });
    this.makeButton(cx + 110, cy + 130, 180, 46, 'MENU', C.btnBlue, () => {
      this.scene.start('MainMenuScene');
    });

    // Particles on victory
    if (victory) {
      for (let i = 0; i < 20; i++) {
        const px = Phaser.Math.Between(0, GAME_WIDTH);
        const dot = this.add.arc(px, GAME_HEIGHT + 10, Phaser.Math.Between(3, 8), 0, 360, false,
          [0xffd700, 0x2ecc71, 0x00d4ff][Math.floor(Math.random() * 3)]);
        this.tweens.add({
          targets: dot, y: -20, duration: Phaser.Math.Between(1500, 3000),
          delay: Phaser.Math.Between(0, 2000), repeat: -1,
          onRepeat: () => { dot.x = Phaser.Math.Between(0, GAME_WIDTH); dot.y = GAME_HEIGHT + 10; },
        });
      }
    }
  }

  private makeButton(x: number, y: number, w: number, h: number, label: string, color: number, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, w, h, color).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(2, 0xffffff, 0.3);
    this.add.text(x, y, label, { fontSize: '18px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setAlpha(0.85));
    bg.on('pointerout', () => bg.setAlpha(1));
    bg.on('pointerdown', onClick);
  }
}
