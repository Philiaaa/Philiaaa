import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, C } from '../config';
import { WARD_CLASSES, buildInitialGameState } from '../data/classes';
import { WardClass } from '../types';

export class ClassSelectScene extends Phaser.Scene {
  private selectedId: string | null = null;
  private confirmBtn: Phaser.GameObjects.Rectangle;
  private confirmText: Phaser.GameObjects.Text;
  private cardHighlights: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  constructor() { super({ key: 'ClassSelectScene' }); }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a1a3e, 0x1a1a3e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.text(cx, 30, 'CHOISIR VOTRE GARDIEN', {
      fontSize: '22px', fontStyle: 'bold', color: '#00d4ff',
      stroke: '#003366', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 58, 'Votre classe détermine vos tours de départ et votre bonus passif', {
      fontSize: '12px', color: '#6666aa',
    }).setOrigin(0.5);

    const cardW = 170;
    const cardH = 300;
    const gap = 12;
    const totalW = WARD_CLASSES.length * cardW + (WARD_CLASSES.length - 1) * gap;
    const startX = cx - totalW / 2;

    WARD_CLASSES.forEach((cls, i) => {
      const cardX = startX + i * (cardW + gap) + cardW / 2;
      const cardY = 240;
      this.makeClassCard(cardX, cardY, cardW, cardH, cls);
    });

    // Confirm button (disabled initially)
    this.confirmBtn = this.add.rectangle(cx, 435, 200, 46, 0x333355)
      .setStrokeStyle(2, 0x555577, 0.5);
    this.confirmText = this.add.text(cx, 435, 'Sélectionnez une classe', {
      fontSize: '14px', color: '#555577',
    }).setOrigin(0.5);

    // Back button
    const backBg = this.add.rectangle(60, 435, 100, 36, 0x333333).setInteractive({ useHandCursor: true });
    this.add.text(60, 435, '← Retour', { fontSize: '13px', color: '#888888' }).setOrigin(0.5);
    backBg.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }

  private makeClassCard(x: number, y: number, w: number, h: number, cls: WardClass): void {
    const bg = this.add.rectangle(x, y, w, h, 0x1a1a2e).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(2, cls.color, 0.4);

    const highlight = this.add.rectangle(x, y, w, h).setStrokeStyle(3, cls.color, 0);
    this.cardHighlights.set(cls.id, highlight);

    // Color banner
    this.add.rectangle(x, y - h / 2 + 22, w, 44, cls.color, 0.8);
    this.add.text(x, y - h / 2 + 22, cls.name, {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      wordWrap: { width: w - 10 }, align: 'center',
    }).setOrigin(0.5);

    // Starting towers
    const towersY = y - h / 2 + 64;
    this.add.text(x, towersY, 'Tours de départ :', {
      fontSize: '10px', color: '#8888bb',
    }).setOrigin(0.5);

    const towerNames = cls.startingTowers.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
    this.add.text(x, towersY + 16, towerNames, {
      fontSize: '11px', color: '#ccccff', wordWrap: { width: w - 14 }, align: 'center',
    }).setOrigin(0.5);

    // Gold
    this.add.text(x, towersY + 40, `Or de départ : ${cls.startingGold}`, {
      fontSize: '11px', color: '#ffd700',
    }).setOrigin(0.5);

    // Description
    this.add.text(x, y + 10, cls.description, {
      fontSize: '10px', color: '#aaaacc',
      wordWrap: { width: w - 14 }, align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);

    // Bonus
    this.add.rectangle(x, y + h / 2 - 28, w - 16, 30, cls.color, 0.15)
      .setStrokeStyle(1, cls.color, 0.5);
    this.add.text(x, y + h / 2 - 28, `✦ ${cls.bonus}`, {
      fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
      wordWrap: { width: w - 20 }, align: 'center',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x222244));
    bg.on('pointerout', () => {
      bg.setFillStyle(this.selectedId === cls.id ? 0x1a2a4e : 0x1a1a2e);
    });
    bg.on('pointerdown', () => this.selectClass(cls));
  }

  private selectClass(cls: WardClass): void {
    // Reset all highlights
    this.cardHighlights.forEach((rect, id) => {
      rect.setStrokeStyle(3, WARD_CLASSES.find(c => c.id === id)!.color, 0);
    });

    this.selectedId = cls.id;
    this.cardHighlights.get(cls.id)?.setStrokeStyle(3, cls.color, 1);

    // Enable confirm button
    this.confirmBtn.setFillStyle(C.btnBlue).setInteractive({ useHandCursor: true });
    this.confirmBtn.setStrokeStyle(2, 0xaaaaff, 0.8);
    this.confirmText.setText('COMMENCER →').setColor('#ffffff');

    this.confirmBtn.removeAllListeners('pointerdown');
    this.confirmBtn.on('pointerdown', () => {
      const gs = buildInitialGameState(this.selectedId!);
      this.scene.start('GameScene', { gameState: gs, classId: this.selectedId });
    });

    this.confirmBtn.on('pointerover', () => this.confirmBtn.setFillStyle(0x2a5aaa));
    this.confirmBtn.on('pointerout', () => this.confirmBtn.setFillStyle(C.btnBlue));
  }
}
