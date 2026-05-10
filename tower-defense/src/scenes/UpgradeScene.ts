import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, C } from '../config';
import { GameState, UpgradeDefinition } from '../types';
import { selectUpgrades, applyUpgrade } from '../systems/UpgradeSystem';
import { generateWave } from '../data/waves';
import { Sfx } from '../systems/AudioSystem';

export class UpgradeScene extends Phaser.Scene {
  constructor() { super({ key: 'UpgradeScene' }); }

  create(data: { gameState: GameState; wave: number }): void {
    const { gameState, wave } = data;
    const cx = GAME_WIDTH / 2;

    // Dim overlay
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);

    // Panel
    const panelW = 680;
    const panelH = 360;
    const panelY = GAME_HEIGHT / 2 + 10;
    this.add.rectangle(cx, panelY, panelW, panelH, 0x0d1530, 0.97)
      .setStrokeStyle(2, 0x2a4a8a, 1);

    // Title
    this.add.text(cx, panelY - panelH / 2 + 28, `VAGUE ${wave} TERMINÉE — CHOISIR UNE AMÉLIORATION`, {
      fontSize: '15px', fontStyle: 'bold', color: '#00d4ff',
    }).setOrigin(0.5);

    this.add.text(cx, panelY - panelH / 2 + 50, 'Choisissez 1 amélioration parmi 3', {
      fontSize: '12px', color: '#6666aa',
    }).setOrigin(0.5);

    const upgrades = selectUpgrades(gameState, 3);
    const cardW = 190;
    const cardH = 210;
    const gap = 18;
    const totalW = upgrades.length * cardW + (upgrades.length - 1) * gap;
    const startX = cx - totalW / 2 + cardW / 2;
    const cardY = panelY + 30;

    upgrades.forEach((upg, i) => {
      const cardX = startX + i * (cardW + gap);
      this.makeUpgradeCard(cardX, cardY, cardW, cardH, upg, gameState, wave);
    });

    // Skip button (lose upgrade, keep gold)
    const skipY = panelY + panelH / 2 - 30;
    const skipBg = this.add.rectangle(cx, skipY, 140, 34, 0x222233).setInteractive({ useHandCursor: true });
    skipBg.setStrokeStyle(1, 0x555577, 0.6);
    this.add.text(cx, skipY, 'Passer (sans bonus)', { fontSize: '12px', color: '#555577' }).setOrigin(0.5);
    skipBg.on('pointerover', () => skipBg.setFillStyle(0x2a2a44));
    skipBg.on('pointerout', () => skipBg.setFillStyle(0x222233));
    skipBg.on('pointerdown', () => this.finishUpgrade(gameState, null, wave));
  }

  private makeUpgradeCard(
    x: number, y: number, w: number, h: number,
    upg: UpgradeDefinition,
    gs: GameState,
    wave: number
  ): void {
    const catColor = upg.category === 'global' ? 0x00b894
      : upg.category === 'special' ? 0xffd700
      : 0x6c5ce7;

    const bg = this.add.rectangle(x, y, w, h, 0x111128).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(2, catColor, 0.5);

    // Category banner
    this.add.rectangle(x, y - h / 2 + 20, w, 38, catColor, 0.25);
    this.add.rectangle(x, y - h / 2 + 20, w, 38).setStrokeStyle(1, catColor, 0.4);

    const catLabel = upg.category === 'tower'
      ? `Tour ${upg.towerType ? upg.towerType.charAt(0).toUpperCase() + upg.towerType.slice(1) : ''}`
      : upg.category === 'global' ? 'Global' : 'Spécial';

    this.add.text(x, y - h / 2 + 14, catLabel, {
      fontSize: '10px', color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(x, y - h / 2 + 28, upg.name, {
      fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      wordWrap: { width: w - 16 }, align: 'center',
    }).setOrigin(0.5);

    this.add.text(x, y + 10, upg.description, {
      fontSize: '12px', color: '#ccccee',
      wordWrap: { width: w - 20 }, align: 'center', lineSpacing: 5,
    }).setOrigin(0.5);

    // Pick button at bottom
    const btnY = y + h / 2 - 26;
    const btn = this.add.rectangle(x, btnY, w - 20, 34, catColor, 0.8)
      .setStrokeStyle(1, 0xffffff, 0.3);
    this.add.text(x, btnY, 'CHOISIR', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setFillStyle(0x1a1a40);
      bg.setStrokeStyle(2, catColor, 1);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x111128);
      bg.setStrokeStyle(2, catColor, 0.5);
    });
    bg.on('pointerdown', () => this.finishUpgrade(gs, upg, wave));
  }

  private finishUpgrade(gs: GameState, upg: UpgradeDefinition | null, wave: number): void {
    if (upg) {
      applyUpgrade(gs, upg);
      Sfx.upgradeSelect();
    }

    // Bonus gold for completing wave
    const waveDef = generateWave(wave);
    gs.gold += waveDef.bonusGold;

    // Nexus regen
    if (gs.globalModifiers.nexusRegenPerWave > 0) {
      gs.nexusHp = Math.min(gs.maxNexusHp, gs.nexusHp + gs.globalModifiers.nexusRegenPerWave);
    }

    const gameScene = this.scene.get('GameScene');
    gameScene.events.emit('upgradeComplete', gs, wave + 1);
    this.scene.stop('UpgradeScene');
    this.scene.resume('GameScene');
  }
}
