import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, C } from '../config';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a1a3e, 0x1a1a3e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Decorative grid lines
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x2a2a4a, 0.4);
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      grid.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      grid.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Glowing orb behind title
    const orb = this.add.arc(cx, 170, 80, 0, 360, false, 0x00d4ff, 0.08);
    this.tweens.add({ targets: orb, scaleX: 1.3, scaleY: 1.3, alpha: 0.04, duration: 2000, yoyo: true, repeat: -1 });

    // Title
    this.add.text(cx, 120, 'NEXUS RIFT', {
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#00d4ff',
      stroke: '#003366',
      strokeThickness: 6,
      shadow: { blur: 20, color: '#00d4ff', fill: true },
    }).setOrigin(0.5);

    this.add.text(cx, 175, 'Tower Defense Roguelite', {
      fontSize: '18px',
      color: '#8888bb',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Play button
    this.makeButton(cx, 270, 200, 52, 'JOUER', C.btnGreen, () => {
      this.scene.start('ClassSelectScene');
    });

    // Info text
    this.add.text(cx, 360, 'Défendez votre Nexus contre des vagues d\'ennemis.\nChoisissez des améliorations aléatoires entre chaque vague.', {
      fontSize: '13px',
      color: '#6666aa',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Version
    this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 8, 'v0.1', {
      fontSize: '10px', color: '#333355',
    }).setOrigin(1, 1);

    // Floating particles
    for (let i = 0; i < 12; i++) {
      const px = Phaser.Math.Between(20, GAME_WIDTH - 20);
      const py = Phaser.Math.Between(20, GAME_HEIGHT - 20);
      const dot = this.add.arc(px, py, Phaser.Math.Between(1, 3), 0, 360, false, 0x00d4ff, 0.4);
      this.tweens.add({
        targets: dot,
        y: py - Phaser.Math.Between(40, 80),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        yoyo: false,
        onRepeat: () => { dot.y = py; dot.alpha = 0.4; },
      });
    }
  }

  private makeButton(
    x: number, y: number, w: number, h: number,
    label: string, color: number, onClick: () => void
  ): void {
    const bg = this.add.rectangle(x, y, w, h, color).setInteractive({ useHandCursor: true });
    const border = this.add.rectangle(x, y, w, h).setStrokeStyle(2, 0xffffff, 0.3);
    const text = this.add.text(x, y, label, {
      fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.ValueToColor(color).brighten(20).color);
      this.tweens.add({ targets: [bg, border, text], scaleX: 1.04, scaleY: 1.04, duration: 80 });
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(color);
      this.tweens.add({ targets: [bg, border, text], scaleX: 1, scaleY: 1, duration: 80 });
    });
    bg.on('pointerdown', onClick);
  }
}
