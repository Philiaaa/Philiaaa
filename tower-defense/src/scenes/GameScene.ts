import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, GRID_COLS, GRID_ROWS,
  GRID_X, GRID_Y, GRID_PX_W, GRID_PX_H, RIGHT_PANEL_X, RIGHT_PANEL_W, C,
} from '../config';
import {
  TowerType, EnemyType, GameState,
  TowerInstance, EnemyInstance, ProjectileInstance,
} from '../types';
import { TOWER_STATS, TOWER_ORDER } from '../data/towers';
import { ENEMY_STATS } from '../data/enemies';
import { generateWave } from '../data/waves';
import { generatePath, pathToPixels, buildGrid } from '../systems/PathSystem';

type Phase = 'planning' | 'wave' | 'upgrading';

interface SpawnQueue {
  type: EnemyType;
  remaining: number;
  interval: number;
  timer: number;
}

export class GameScene extends Phaser.Scene {
  private gs!: GameState;
  private phase: Phase = 'planning';

  // Map
  private grid!: string[][];
  private pathNodes!: { col: number; row: number }[];
  private pathPx!: { x: number; y: number }[];
  private nexusCol = 0;
  private nexusRow = 0;
  private spawnCol = 0;
  private spawnRow = 0;

  // Game objects
  private towers: TowerInstance[] = [];
  private enemies: EnemyInstance[] = [];
  private projectiles: ProjectileInstance[] = [];
  private enemyIdCounter = 0;

  // Spawn control
  private spawnQueues: SpawnQueue[] = [];
  private totalToSpawn = 0;
  private totalSpawned = 0;
  private waveDelay = 0;

  // Selection
  private selectedType: TowerType | null = null;
  private ghostRect: Phaser.GameObjects.Rectangle | null = null;
  private ghostRange: Phaser.GameObjects.Arc | null = null;

  // Graphics layers
  private gridGfx!: Phaser.GameObjects.Graphics;
  private effectsGfx!: Phaser.GameObjects.Graphics;
  private firePools: { x: number; y: number; radius: number; timer: number }[] = [];

  // HUD
  private hudGfx!: Phaser.GameObjects.Graphics;
  private txtWave!: Phaser.GameObjects.Text;
  private txtGold!: Phaser.GameObjects.Text;
  private txtHP!: Phaser.GameObjects.Text;
  private txtPhase!: Phaser.GameObjects.Text;
  private startWaveBtn!: Phaser.GameObjects.Rectangle;
  private startWaveTxt!: Phaser.GameObjects.Text;
  private towerBtns: Phaser.GameObjects.Rectangle[] = [];
  private selectedHighlights: Phaser.GameObjects.Rectangle[] = [];
  private txtEnemiesLeft!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'GameScene' }); }

  create(data: { gameState: GameState }): void {
    this.gs = data.gameState;
    this.phase = 'planning';
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.firePools = [];

    this.generateLevel();
    this.drawGrid();
    this.buildHUD();
    this.buildRightPanel();
    this.setupInput();
    this.placeStartingTowers();
    this.updateHUD();

    // Listen for upgrade completion
    this.events.on('upgradeComplete', (newGs: GameState, nextWave: number) => {
      this.gs = newGs;
      this.gs.wave = nextWave;
      this.phase = 'planning';
      this.updateHUD();
      this.setStartBtnVisible(true);
    });
  }

  // ─── Level Generation ──────────────────────────────────────────────
  private generateLevel(): void {
    this.pathNodes = generatePath();
    this.pathPx = pathToPixels(this.pathNodes);
    this.grid = buildGrid(this.pathNodes);

    const spawn = this.pathNodes[0];
    const nexus = this.pathNodes[this.pathNodes.length - 1];
    this.spawnCol = spawn.col; this.spawnRow = spawn.row;
    this.nexusCol = nexus.col; this.nexusRow = nexus.row;
  }

  // ─── Grid Drawing ──────────────────────────────────────────────────
  private drawGrid(): void {
    this.gridGfx = this.add.graphics().setDepth(0);
    this.effectsGfx = this.add.graphics().setDepth(2);
    this.redrawGrid();
  }

  private redrawGrid(): void {
    this.gridGfx.clear();

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const px = GRID_X + col * TILE_SIZE;
        const py = GRID_Y + row * TILE_SIZE;
        const tile = this.grid[row][col];

        let fill: number = C.gridEmpty;
        if (tile === 'path') fill = C.gridPath;
        else if (tile === 'nexus') fill = C.nexusTile;
        else if (tile === 'spawn') fill = C.spawnTile;

        this.gridGfx.fillStyle(fill, 1);
        this.gridGfx.fillRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);

        // Border
        this.gridGfx.lineStyle(1, C.gridBorder, 0.5);
        this.gridGfx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
      }
    }

    // Nexus glow decoration
    const nx = GRID_X + this.nexusCol * TILE_SIZE + TILE_SIZE / 2;
    const ny = GRID_Y + this.nexusRow * TILE_SIZE + TILE_SIZE / 2;
    this.gridGfx.lineStyle(2, C.nexusGlow, 0.8);
    this.gridGfx.strokeRect(
      GRID_X + this.nexusCol * TILE_SIZE + 3,
      GRID_Y + this.nexusRow * TILE_SIZE + 3,
      TILE_SIZE - 6, TILE_SIZE - 6
    );
    this.gridGfx.fillStyle(C.nexusGlow, 0.15);
    this.gridGfx.fillRect(
      GRID_X + this.nexusCol * TILE_SIZE + 3,
      GRID_Y + this.nexusRow * TILE_SIZE + 3,
      TILE_SIZE - 6, TILE_SIZE - 6
    );

    // NEXUS label
    this.add.text(nx, ny, 'N', {
      fontSize: '14px', fontStyle: 'bold', color: '#00d4ff',
    }).setOrigin(0.5).setDepth(1);

    // SPAWN label
    const sx = GRID_X + this.spawnCol * TILE_SIZE + TILE_SIZE / 2;
    const sy = GRID_Y + this.spawnRow * TILE_SIZE + TILE_SIZE / 2;
    this.add.text(sx, sy, '▶', { fontSize: '14px', color: '#ff6b6b' }).setOrigin(0.5).setDepth(1);

    // Draw path arrows
    this.drawPathArrows();
  }

  private drawPathArrows(): void {
    for (let i = 1; i < this.pathNodes.length - 1; i++) {
      const cur = this.pathNodes[i];
      const next = this.pathNodes[i + 1];
      if (!next) continue;
      const dc = next.col - cur.col;
      const dr = next.row - cur.row;
      const arrow = dc === 1 ? '→' : dc === -1 ? '←' : dr === 1 ? '↓' : '↑';
      const tx = GRID_X + cur.col * TILE_SIZE + TILE_SIZE / 2;
      const ty = GRID_Y + cur.row * TILE_SIZE + TILE_SIZE / 2;
      this.add.text(tx, ty, arrow, {
        fontSize: '12px', color: '#6a4a30',
      }).setOrigin(0.5).setDepth(1).setAlpha(0.7);
    }
  }

  // ─── HUD ───────────────────────────────────────────────────────────
  private buildHUD(): void {
    this.hudGfx = this.add.graphics().setDepth(10);
    this.hudGfx.fillStyle(C.hudBg, 1);
    this.hudGfx.fillRect(0, 0, GAME_WIDTH, GRID_Y);
    this.hudGfx.lineStyle(1, C.panelBorder, 0.8);
    this.hudGfx.lineBetween(0, GRID_Y, GAME_WIDTH, GRID_Y);

    const d = 10;
    this.txtWave = this.add.text(d, 8, '', { fontSize: '13px', color: '#2ed573', fontStyle: 'bold' }).setDepth(11);
    this.txtHP = this.add.text(140, 8, '', { fontSize: '13px', color: '#ff4757' }).setDepth(11);
    this.txtGold = this.add.text(310, 8, '', { fontSize: '13px', color: '#ffd700' }).setDepth(11);
    this.txtPhase = this.add.text(480, 8, '', { fontSize: '13px', color: '#8888cc' }).setDepth(11);
    this.txtEnemiesLeft = this.add.text(d, 30, '', { fontSize: '11px', color: '#aaaacc' }).setDepth(11);
  }

  private updateHUD(): void {
    const gs = this.gs;
    this.txtWave.setText(`Vague ${gs.wave}`);
    this.txtHP.setText(`❤ ${gs.nexusHp}/${gs.maxNexusHp} HP`);
    this.txtGold.setText(`🪙 ${gs.gold} or`);
    this.txtPhase.setText(
      this.phase === 'planning' ? '[ Placement ]'
      : this.phase === 'wave'    ? '[ Vague en cours ]'
      : '[ Amélioration ]'
    );

    if (this.phase === 'wave') {
      const alive = this.enemies.filter(e => !e.isDead && !e.hitNexus).length;
      const remaining = this.totalToSpawn - this.totalSpawned;
      this.txtEnemiesLeft.setText(`Ennemis : ${alive} actifs + ${remaining} à venir`);
    } else {
      this.txtEnemiesLeft.setText('');
    }
  }

  // ─── Right Panel ───────────────────────────────────────────────────
  private buildRightPanel(): void {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(C.panelBg, 1);
    g.fillRect(RIGHT_PANEL_X, 0, RIGHT_PANEL_W, GAME_HEIGHT);
    g.lineStyle(1, C.panelBorder, 0.8);
    g.lineBetween(RIGHT_PANEL_X, 0, RIGHT_PANEL_X, GAME_HEIGHT);

    this.add.text(RIGHT_PANEL_X + RIGHT_PANEL_W / 2, GRID_Y + 10, 'TOURS', {
      fontSize: '11px', color: '#8888bb', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(11);

    const cols = 2;
    const btnW = 88;
    const btnH = 64;
    const padX = 8;
    const padY = 8;
    const startX = RIGHT_PANEL_X + padX + btnW / 2;
    const startY = GRID_Y + 26;

    TOWER_ORDER.forEach((type, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnW + padX);
      const by = startY + row * (btnH + padY);

      const stats = TOWER_STATS[type];

      const bg = this.add.rectangle(bx, by, btnW, btnH, 0x1a1a30).setInteractive({ useHandCursor: true }).setDepth(11);
      bg.setStrokeStyle(1, stats.color, 0.4);

      // Color dot
      this.add.arc(bx, by - 14, 10, 0, 360, false, stats.color).setDepth(12);

      this.add.text(bx, by + 2, stats.name, {
        fontSize: '10px', color: '#ccccff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(12);
      this.add.text(bx, by + 16, `${stats.cost}🪙`, {
        fontSize: '9px', color: '#ffd700',
      }).setOrigin(0.5).setDepth(12);

      const sel = this.add.rectangle(bx, by, btnW, btnH).setStrokeStyle(2, stats.color, 0).setDepth(13);
      this.selectedHighlights.push(sel);
      this.towerBtns.push(bg);

      bg.on('pointerover', () => bg.setFillStyle(0x22223a));
      bg.on('pointerout', () => bg.setFillStyle(
        this.selectedType === type ? 0x1a2a3a : 0x1a1a30
      ));
      bg.on('pointerdown', () => this.selectTowerType(type, i));
    });

    // Start Wave button
    const sbY = GRID_Y + GRID_PX_H - 30;
    this.startWaveBtn = this.add.rectangle(RIGHT_PANEL_X + RIGHT_PANEL_W / 2, sbY, RIGHT_PANEL_W - 16, 46, C.btnGreen)
      .setInteractive({ useHandCursor: true }).setDepth(11).setStrokeStyle(2, 0x2ecc71, 0.5);
    this.startWaveTxt = this.add.text(RIGHT_PANEL_X + RIGHT_PANEL_W / 2, sbY, 'LANCER\nVAGUE', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setDepth(12);

    this.startWaveBtn.on('pointerover', () => this.startWaveBtn.setFillStyle(0x2ecc71));
    this.startWaveBtn.on('pointerout', () => this.startWaveBtn.setFillStyle(C.btnGreen));
    this.startWaveBtn.on('pointerdown', () => {
      if (this.phase === 'planning') this.startWave();
    });
  }

  private selectTowerType(type: TowerType, idx: number): void {
    this.selectedType = type;
    this.selectedHighlights.forEach((h, i) => {
      h.setStrokeStyle(2, TOWER_STATS[TOWER_ORDER[i]].color, i === idx ? 1 : 0);
    });
    this.towerBtns.forEach((b, i) => b.setFillStyle(i === idx ? 0x1a2a3a : 0x1a1a30));
    this.updateGhost(null, null);
  }

  private setStartBtnVisible(visible: boolean): void {
    this.startWaveBtn.setVisible(visible);
    this.startWaveTxt.setVisible(visible);
  }

  // ─── Input ─────────────────────────────────────────────────────────
  private setupInput(): void {
    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (this.selectedType && this.phase === 'planning') {
        const cell = this.pixelToCell(ptr.x, ptr.y);
        this.updateGhost(cell?.col ?? null, cell?.row ?? null);
      }
    });

    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (ptr.x >= RIGHT_PANEL_X) return;

      if (this.selectedType && this.phase === 'planning') {
        const cell = this.pixelToCell(ptr.x, ptr.y);
        if (cell) this.tryPlaceTower(cell.col, cell.row);
      } else {
        // Tap on tower to show/hide range
        this.toggleTowerRange(ptr.x, ptr.y);
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.selectedType = null;
      this.clearGhost();
      this.selectedHighlights.forEach(h => h.setStrokeStyle(0, 0, 0));
    });
  }

  private pixelToCell(px: number, py: number): { col: number; row: number } | null {
    if (px < GRID_X || px >= GRID_X + GRID_PX_W) return null;
    if (py < GRID_Y || py >= GRID_Y + GRID_PX_H) return null;
    return {
      col: Math.floor((px - GRID_X) / TILE_SIZE),
      row: Math.floor((py - GRID_Y) / TILE_SIZE),
    };
  }

  private updateGhost(col: number | null, row: number | null): void {
    this.clearGhost();
    if (col === null || row === null || !this.selectedType) return;
    if (this.grid[row][col] !== 'empty') return;

    const stats = TOWER_STATS[this.selectedType];
    const px = GRID_X + col * TILE_SIZE + TILE_SIZE / 2;
    const py = GRID_Y + row * TILE_SIZE + TILE_SIZE / 2;
    const affordable = this.gs.gold >= stats.cost;
    const color = affordable ? stats.color : 0xff0000;

    this.ghostRect = this.add.rectangle(px, py, TILE_SIZE - 4, TILE_SIZE - 4, color, 0.5)
      .setStrokeStyle(2, color, 0.8).setDepth(6);

    const tMod = this.gs.towerModifiers[this.selectedType];
    const rangeInPx = stats.range * tMod.rangeMultiplier * TILE_SIZE;
    this.ghostRange = this.add.arc(px, py, rangeInPx, 0, 360, false, color, 0.06)
      .setStrokeStyle(1, color, 0.3).setDepth(5);
  }

  private clearGhost(): void {
    this.ghostRect?.destroy(); this.ghostRect = null;
    this.ghostRange?.destroy(); this.ghostRange = null;
  }

  private toggleTowerRange(px: number, py: number): void {
    const cell = this.pixelToCell(px, py);
    if (!cell) return;
    const tower = this.towers.find(t => t.col === cell.col && t.row === cell.row);
    if (!tower) return;
    const visible = !tower.rangeIndicator.visible;
    this.towers.forEach(t => t.rangeIndicator.setVisible(false));
    tower.rangeIndicator.setVisible(visible);
  }

  // ─── Tower Placement ───────────────────────────────────────────────
  private tryPlaceTower(col: number, row: number): void {
    if (this.grid[row][col] !== 'empty') return;
    const stats = TOWER_STATS[this.selectedType!];
    if (this.gs.gold < stats.cost) {
      this.flashText('Or insuffisant !', RIGHT_PANEL_X + RIGHT_PANEL_W / 2, GRID_Y + GRID_PX_H / 2);
      return;
    }

    this.gs.gold -= stats.cost;
    this.grid[row][col] = 'tower';
    this.spawnTowerVisual(col, row, this.selectedType!);
    this.updateHUD();
  }

  private spawnTowerVisual(col: number, row: number, type: TowerType): void {
    const stats = TOWER_STATS[type];
    const tMod = this.gs.towerModifiers[type];
    const px = GRID_X + col * TILE_SIZE + TILE_SIZE / 2;
    const py = GRID_Y + row * TILE_SIZE + TILE_SIZE / 2;
    const rangeInPx = stats.range * tMod.rangeMultiplier * TILE_SIZE;

    const rangeIndicator = this.add.arc(px, py, rangeInPx, 0, 360, false, stats.color, 0.07)
      .setStrokeStyle(1, stats.color, 0.3).setDepth(1).setVisible(false);

    const body = this.add.rectangle(px, py, TILE_SIZE - 6, TILE_SIZE - 6, stats.color)
      .setStrokeStyle(2, 0xffffff, 0.25).setDepth(3);
    const innerDot = this.add.arc(px, py, 6, 0, 360, false, 0xffffff, 0.5).setDepth(3);

    // Type initial
    this.add.text(px, py + TILE_SIZE / 2 - 8, stats.name[0], {
      fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(3).setAlpha(0.6);

    this.towers.push({ col, row, type, cooldown: 0, body, innerDot, rangeIndicator });
  }

  private placeStartingTowers(): void {
    const startingTypes = this.getStartingTowers();
    // Place in valid empty cells near the nexus
    const placements = this.findEmptyCellsNearNexus(startingTypes.length);
    startingTypes.forEach((type, i) => {
      const cell = placements[i];
      if (!cell) return;
      this.grid[cell.row][cell.col] = 'tower';
      this.spawnTowerVisual(cell.col, cell.row, type);
    });
  }

  private getStartingTowers(): TowerType[] {
    const { WARD_CLASSES } = require('../data/classes');
    const cls = WARD_CLASSES.find((c: any) => c.id === this.gs.classId);
    return cls?.startingTowers ?? [TowerType.ARROW, TowerType.ARROW];
  }

  private findEmptyCellsNearNexus(count: number): { col: number; row: number }[] {
    const cells: { col: number; row: number }[] = [];
    // Search in a spiral from nexus
    for (let dist = 1; dist <= GRID_COLS && cells.length < count; dist++) {
      for (let dr = -dist; dr <= dist && cells.length < count; dr++) {
        for (let dc = -dist; dc <= dist && cells.length < count; dc++) {
          if (Math.abs(dr) !== dist && Math.abs(dc) !== dist) continue;
          const r = this.nexusRow + dr;
          const c = this.nexusCol + dc;
          if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
          if (this.grid[r][c] === 'empty') {
            cells.push({ col: c, row: r });
          }
        }
      }
    }
    return cells;
  }

  // ─── Wave Management ───────────────────────────────────────────────
  private startWave(): void {
    this.gs.wave += 1;
    this.phase = 'wave';
    this.clearGhost();
    this.selectedType = null;
    this.selectedHighlights.forEach(h => h.setStrokeStyle(0, 0, 0));
    this.towerBtns.forEach(b => b.setFillStyle(0x1a1a30));
    this.setStartBtnVisible(false);
    this.towers.forEach(t => t.rangeIndicator.setVisible(false));

    const waveDef = generateWave(this.gs.wave);
    this.spawnQueues = waveDef.spawns.map(s => ({
      type: s.type,
      remaining: s.count,
      interval: s.interval * 1000,
      timer: 0,
    }));
    this.totalToSpawn = waveDef.spawns.reduce((s, sp) => s + sp.count, 0);
    this.totalSpawned = 0;
    this.waveDelay = 1000;
    this.updateHUD();

    this.showWaveBanner(`VAGUE ${this.gs.wave}`);
  }

  private showWaveBanner(text: string): void {
    const banner = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, text, {
      fontSize: '36px', fontStyle: 'bold', color: '#ff4757',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.tweens.add({
      targets: banner, alpha: 1, y: GAME_HEIGHT / 2 - 30,
      duration: 400, ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(700, () => {
          this.tweens.add({ targets: banner, alpha: 0, duration: 400, onComplete: () => banner.destroy() });
        });
      },
    });
  }

  private handleSpawning(delta: number): void {
    if (this.waveDelay > 0) {
      this.waveDelay -= delta;
      return;
    }

    for (const q of this.spawnQueues) {
      if (q.remaining <= 0) continue;
      q.timer += delta;
      if (q.timer >= q.interval) {
        q.timer -= q.interval;
        this.spawnEnemy(q.type);
        q.remaining--;
        this.totalSpawned++;
      }
    }
  }

  private spawnEnemy(type: EnemyType): void {
    const stats = ENEMY_STATS[type];
    const startPx = this.pathPx[0];
    const r = stats.radius;

    const body = this.add.arc(startPx.x, startPx.y, r, 0, 360, false, stats.color).setDepth(4);
    body.setStrokeStyle(2, 0x000000, 0.5);

    const hpBarBg = this.add.rectangle(startPx.x, startPx.y - r - 8, r * 2, 5, 0x000000, 0.8).setDepth(5);
    const hpBarFg = this.add.rectangle(startPx.x - r, startPx.y - r - 8, r * 2, 5, C.hpGreen).setDepth(5).setOrigin(0, 0.5);

    let bossText: Phaser.GameObjects.Text | undefined;
    if (stats.isBoss) {
      bossText = this.add.text(startPx.x, startPx.y - r - 20, 'BOSS', {
        fontSize: '9px', fontStyle: 'bold', color: '#ff4757',
      }).setOrigin(0.5).setDepth(5);
    }

    const scaleUp = stats.isBoss ? 1.4 : 1;
    if (scaleUp !== 1) { body.setScale(scaleUp); }

    this.enemies.push({
      id: ++this.enemyIdCounter,
      type, hp: stats.hp, maxHp: stats.hp,
      x: startPx.x, y: startPx.y,
      pathIdx: 0, subProgress: 0,
      slowFactor: 1, slowMs: 0,
      burnDps: 0, burnMs: 0,
      poisonStacks: 0, poisonTickMs: 0,
      isDead: false, hitNexus: false,
      healTimer: 0,
      body, hpBarBg, hpBarFg, bossText,
    });
  }

  private checkWaveComplete(): void {
    const allQueuesEmpty = this.spawnQueues.every(q => q.remaining <= 0);
    const allEnemiesDone = this.enemies.every(e => e.isDead || e.hitNexus);
    if (allQueuesEmpty && allEnemiesDone) {
      this.onWaveComplete();
    }
  }

  private onWaveComplete(): void {
    this.phase = 'upgrading';
    this.time.delayedCall(600, () => {
      this.scene.pause('GameScene');
      this.scene.launch('UpgradeScene', { gameState: this.gs, wave: this.gs.wave });
    });
  }

  // ─── Update Loop ───────────────────────────────────────────────────
  update(_time: number, delta: number): void {
    if (this.phase !== 'wave') return;

    this.handleSpawning(delta);
    this.updateEnemies(delta);
    this.updateTowers(delta);
    this.updateProjectiles();
    this.updateFirePools(delta);
    this.cleanupDead();
    this.checkWaveComplete();
    this.updateHUD();
  }

  // ─── Enemy Update ──────────────────────────────────────────────────
  private updateEnemies(delta: number): void {
    const dt = delta / 1000;

    for (const e of this.enemies) {
      if (e.isDead || e.hitNexus) continue;

      // Status tick
      if (e.slowMs > 0) { e.slowMs -= delta; if (e.slowMs <= 0) e.slowFactor = 1; }
      if (e.burnMs > 0) { e.burnMs -= delta; this.damageEnemy(e, e.burnDps * dt); }
      if (e.poisonStacks > 0) {
        e.poisonTickMs += delta;
        if (e.poisonTickMs >= 500) { e.poisonTickMs -= 500; this.damageEnemy(e, e.poisonStacks * 2); }
      }

      // Healer: heal nearby enemies every second
      if (e.type === EnemyType.HEALER) {
        e.healTimer += delta;
        if (e.healTimer >= 1000) {
          e.healTimer -= 1000;
          this.enemies.forEach(other => {
            if (other === e || other.isDead) return;
            const dx = other.x - e.x;
            const dy = other.y - e.y;
            if (Math.sqrt(dx * dx + dy * dy) <= 80) {
              other.hp = Math.min(other.maxHp, other.hp + 12);
              this.updateEnemyBar(other);
            }
          });
        }
      }

      if (e.isDead) continue;

      // Move along path
      const speed = ENEMY_STATS[e.type].speed * e.slowFactor;
      let dist = speed * dt;

      while (dist > 0 && e.pathIdx < this.pathPx.length - 1) {
        const cur = this.pathPx[e.pathIdx];
        const nxt = this.pathPx[e.pathIdx + 1];
        const dx = nxt.x - cur.x;
        const dy = nxt.y - cur.y;
        const segLen = Math.sqrt(dx * dx + dy * dy) || 1;
        const covered = e.subProgress * segLen;
        const canMove = segLen - covered;

        if (dist >= canMove) {
          dist -= canMove;
          e.pathIdx++;
          e.subProgress = 0;
          e.x = nxt.x;
          e.y = nxt.y;
        } else {
          e.subProgress = (covered + dist) / segLen;
          e.x = cur.x + dx * e.subProgress;
          e.y = cur.y + dy * e.subProgress;
          dist = 0;
        }
      }

      if (e.pathIdx >= this.pathPx.length - 1) {
        e.hitNexus = true;
        const dmg = ENEMY_STATS[e.type].damage;
        this.gs.nexusHp -= dmg;
        this.flashNexusDamage();
        this.destroyEnemy(e);
        if (this.gs.nexusHp <= 0) { this.gameOver(); return; }
        continue;
      }

      // Update visuals
      e.body.x = e.x; e.body.y = e.y;
      const r = ENEMY_STATS[e.type].radius;
      e.hpBarBg.x = e.x; e.hpBarBg.y = e.y - r - 8;
      e.hpBarFg.x = e.x - r; e.hpBarFg.y = e.y - r - 8;
      if (e.bossText) { e.bossText.x = e.x; e.bossText.y = e.y - r - 20; }

      this.updateEnemyBar(e);

      // Color tint for status
      if (e.burnMs > 0) e.body.setFillStyle(Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(ENEMY_STATS[e.type].color),
        Phaser.Display.Color.ValueToColor(0xff6b00), 100, 60).color);
      else if (e.slowMs > 0) e.body.setFillStyle(0xaaddff);
      else e.body.setFillStyle(ENEMY_STATS[e.type].color);
    }
  }

  private updateEnemyBar(e: EnemyInstance): void {
    const r = ENEMY_STATS[e.type].radius;
    const ratio = Math.max(0, e.hp / e.maxHp);
    const barW = r * 2;
    const color = ratio > 0.6 ? C.hpGreen : ratio > 0.3 ? 0xf39c12 : C.hp;
    e.hpBarFg.width = barW * ratio;
    e.hpBarFg.setFillStyle(color);
  }

  private damageEnemy(e: EnemyInstance, dmg: number): void {
    if (e.isDead || dmg <= 0) return;
    e.hp -= dmg;
    if (e.hp <= 0) {
      e.hp = 0;
      e.isDead = true;
      this.onEnemyKilled(e);
    }
  }

  private onEnemyKilled(e: EnemyInstance): void {
    const rawGold = ENEMY_STATS[e.type].reward;
    const gold = Math.floor(rawGold * this.gs.globalModifiers.goldMultiplier);
    this.gs.gold += gold;
    this.gs.score += rawGold * 10;

    this.floatText(`+${gold}🪙`, e.x, e.y, '#ffd700');

    // Kill chain proc
    if (this.gs.globalModifiers.killChainChance > 0 && Math.random() < this.gs.globalModifiers.killChainChance) {
      this.triggerChainLightning(e.x, e.y);
    }
  }

  private triggerChainLightning(ox: number, oy: number): void {
    this.enemies.forEach(target => {
      if (target.isDead || target.hitNexus) return;
      const dx = target.x - ox; const dy = target.y - oy;
      if (Math.sqrt(dx * dx + dy * dy) <= 120) {
        this.damageEnemy(target, 30);
      }
    });
    // Visual flash
    const flash = this.add.arc(ox, oy, 60, 0, 360, false, 0xffd700, 0.3).setDepth(8);
    this.tweens.add({ targets: flash, alpha: 0, radius: 80, duration: 300, onComplete: () => flash.destroy() });
  }

  private destroyEnemy(e: EnemyInstance): void {
    e.body.destroy();
    e.hpBarBg.destroy();
    e.hpBarFg.destroy();
    e.bossText?.destroy();
    e.isDead = true;
  }

  private cleanupDead(): void {
    this.enemies = this.enemies.filter(e => !e.isDead && !e.hitNexus);
    this.projectiles = this.projectiles.filter(p => p.active);
  }

  private flashNexusDamage(): void {
    const nx = GRID_X + this.nexusCol * TILE_SIZE + TILE_SIZE / 2;
    const ny = GRID_Y + this.nexusRow * TILE_SIZE + TILE_SIZE / 2;
    const flash = this.add.rectangle(nx, ny, TILE_SIZE, TILE_SIZE, 0xff0000, 0.6).setDepth(7);
    this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
    this.cameras.main.shake(150, 0.004);
    this.updateHUD();
  }

  // ─── Tower Attack ──────────────────────────────────────────────────
  private updateTowers(delta: number): void {
    const nexusCol = this.nexusCol;

    // Compute support bonuses
    const supportBonuses = new Map<TowerInstance, number>();
    this.towers.forEach(t => {
      if (t.type === TowerType.SUPPORT) {
        const tMod = this.gs.towerModifiers[TowerType.SUPPORT];
        const rangeInPx = TOWER_STATS[TowerType.SUPPORT].range * tMod.rangeMultiplier * TILE_SIZE;
        const bonus = (TOWER_STATS[TowerType.SUPPORT].specialValue || 0.30) + tMod.specialEffectStr;
        this.towers.forEach(other => {
          if (other === t || other.type === TowerType.SUPPORT) return;
          const dx = (other.col - t.col) * TILE_SIZE;
          const dy = (other.row - t.row) * TILE_SIZE;
          if (Math.sqrt(dx * dx + dy * dy) <= rangeInPx) {
            supportBonuses.set(other, (supportBonuses.get(other) || 0) + bonus);
          }
        });
      }
    });

    for (const tower of this.towers) {
      if (tower.type === TowerType.SUPPORT) {
        tower.cooldown = Math.max(0, tower.cooldown - delta);
        continue;
      }

      tower.cooldown = Math.max(0, tower.cooldown - delta);
      if (tower.cooldown > 0) continue;

      const stats = TOWER_STATS[tower.type];
      const tMod = this.gs.towerModifiers[tower.type];
      const gMod = this.gs.globalModifiers;

      const rangeInPx = stats.range * tMod.rangeMultiplier * TILE_SIZE;
      const speedMult = tMod.speedMultiplier * gMod.speedMultiplier;
      const dmgMult = tMod.damageMultiplier * gMod.damageMultiplier;
      const nearBonus = Math.abs(tower.col - nexusCol) <= 2 ? gMod.nearNexusDamageMultiplier : 1;
      const suppBonus = 1 + (supportBonuses.get(tower) || 0);
      const finalDmg = stats.damage * dmgMult * nearBonus * suppBonus;
      const cooldownMs = (1 / (stats.attackSpeed * speedMult)) * 1000;

      const tx = GRID_X + tower.col * TILE_SIZE + TILE_SIZE / 2;
      const ty = GRID_Y + tower.row * TILE_SIZE + TILE_SIZE / 2;

      // Find nearest enemy
      let nearest: EnemyInstance | null = null;
      let nearestDist = Infinity;
      for (const e of this.enemies) {
        if (e.isDead || e.hitNexus) continue;
        const dx = e.x - tx; const dy = e.y - ty;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= rangeInPx && d < nearestDist) { nearest = e; nearestDist = d; }
      }
      if (!nearest) continue;

      tower.cooldown = cooldownMs;

      // Fire projectile(s)
      const extraProj = tMod.extraProjectiles;
      const numTargets = 1 + extraProj;

      if (stats.special === 'chain') {
        // Chain lightning: get multiple targets
        const chainCount = Math.floor((stats.specialValue || 3) + extraProj);
        const targets = this.getChainTargets(nearest, chainCount, rangeInPx * 1.5);
        for (const target of targets) {
          this.fireProjectile(tx, ty, target, finalDmg, stats, tMod);
        }
      } else {
        // Multishot: fire at same target multiple times
        for (let i = 0; i < numTargets; i++) {
          this.fireProjectile(tx, ty, nearest, finalDmg, stats, tMod);
        }
      }

      // Tower fire animation
      this.tweens.add({
        targets: tower.body, scaleX: 1.15, scaleY: 1.15,
        duration: 80, yoyo: true,
      });
    }
  }

  private getChainTargets(primary: EnemyInstance, count: number, range: number): EnemyInstance[] {
    const targets = [primary];
    const sorted = this.enemies
      .filter(e => !e.isDead && !e.hitNexus && e !== primary)
      .sort((a, b) => {
        const da = Math.sqrt((a.x - primary.x) ** 2 + (a.y - primary.y) ** 2);
        const db = Math.sqrt((b.x - primary.x) ** 2 + (b.y - primary.y) ** 2);
        return da - db;
      });
    for (const e of sorted) {
      if (targets.length >= count) break;
      const dx = e.x - primary.x; const dy = e.y - primary.y;
      if (Math.sqrt(dx * dx + dy * dy) <= range) targets.push(e);
    }
    return targets;
  }

  private fireProjectile(
    fromX: number, fromY: number,
    target: EnemyInstance,
    damage: number,
    stats: any,
    tMod: any,
  ): void {
    const aoeRadius = stats.special === 'aoe'
      ? (stats.specialValue || 1.5) * tMod.rangeMultiplier * TILE_SIZE * 0.6
      : 0;

    const pBody = this.add.arc(fromX, fromY, 5, 0, 360, false, stats.color).setDepth(6);

    this.projectiles.push({
      targetId: target.id,
      damage,
      special: stats.special,
      specialVal: stats.specialValue,
      aoeRadius,
      body: pBody,
      active: true,
    });
  }

  // ─── Projectile Update ─────────────────────────────────────────────
  private updateProjectiles(): void {
    const PROJ_SPEED = 420;

    for (const p of this.projectiles) {
      if (!p.active) continue;

      const target = this.enemies.find(e => e.id === p.targetId);
      if (!target || target.isDead || target.hitNexus) {
        p.body.destroy();
        p.active = false;
        continue;
      }

      const dx = target.x - p.body.x;
      const dy = target.y - p.body.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Fixed step per frame (not delta-based to avoid tunneling)
      const step = PROJ_SPEED / 60;

      if (dist <= step + 5) {
        // Hit!
        this.onProjectileHit(p, target);
        p.body.destroy();
        p.active = false;
      } else {
        p.body.x += (dx / dist) * step;
        p.body.y += (dy / dist) * step;
      }
    }
  }

  private onProjectileHit(p: ProjectileInstance, target: EnemyInstance): void {
    switch (p.special) {
      case 'aoe': {
        const r = p.aoeRadius || 60;
        this.enemies.forEach(e => {
          if (e.isDead || e.hitNexus) return;
          const dx = e.x - target.x; const dy = e.y - target.y;
          if (Math.sqrt(dx * dx + dy * dy) <= r) this.damageEnemy(e, p.damage);
        });
        const flash = this.add.arc(target.x, target.y, r, 0, 360, false, 0x6c5ce7, 0.35).setDepth(7);
        this.tweens.add({ targets: flash, alpha: 0, radius: r * 1.4, duration: 350, onComplete: () => flash.destroy() });
        break;
      }
      case 'burn': {
        const burnDps = (p.specialVal || 8);
        const burnDur = 2000 * (1 + (this.gs.towerModifiers[TowerType.FLAME].specialEffectStr || 0));
        target.burnDps = Math.max(target.burnDps, burnDps);
        target.burnMs = Math.max(target.burnMs, burnDur);
        this.damageEnemy(target, p.damage);
        // Check for fire pool
        if (this.gs.towerModifiers[TowerType.FLAME].extraEffects.includes('pool') && target.isDead) {
          this.firePools.push({ x: target.x, y: target.y, radius: 30, timer: 3000 });
        }
        break;
      }
      case 'slow': {
        const slowFactor = 1 - (p.specialVal || 0.5);
        const slowDur = 2000 * (1 + (this.gs.towerModifiers[TowerType.FROST].specialEffectStr || 0));
        target.slowFactor = Math.min(target.slowFactor, slowFactor);
        target.slowMs = Math.max(target.slowMs, slowDur);
        this.damageEnemy(target, p.damage);
        break;
      }
      case 'poison': {
        const stacks = (p.specialVal || 3) + (this.gs.towerModifiers[TowerType.POISON].specialEffectStr || 0);
        target.poisonStacks += stacks;
        this.damageEnemy(target, p.damage);
        break;
      }
      case 'lifesteal': {
        const healAmt = p.damage * ((p.specialVal || 0.10) + (this.gs.towerModifiers[TowerType.DARK].specialEffectStr || 0));
        this.damageEnemy(target, p.damage);
        if (!target.isDead) {
          this.gs.nexusHp = Math.min(this.gs.maxNexusHp, this.gs.nexusHp + healAmt);
        }
        break;
      }
      case 'chain': {
        // Each chain projectile deals damage to its target
        this.damageEnemy(target, p.damage * 0.6); // chain targets get 60%
        break;
      }
      default:
        this.damageEnemy(target, p.damage);
    }
  }

  // ─── Fire Pools ────────────────────────────────────────────────────
  private updateFirePools(delta: number): void {
    this.effectsGfx.clear();
    for (let i = this.firePools.length - 1; i >= 0; i--) {
      const fp = this.firePools[i];
      fp.timer -= delta;
      if (fp.timer <= 0) { this.firePools.splice(i, 1); continue; }

      this.effectsGfx.fillStyle(0xff6b00, 0.3 * (fp.timer / 3000));
      this.effectsGfx.fillCircle(fp.x, fp.y, fp.radius);

      this.enemies.forEach(e => {
        if (e.isDead || e.hitNexus) return;
        const dx = e.x - fp.x; const dy = e.y - fp.y;
        if (Math.sqrt(dx * dx + dy * dy) <= fp.radius) {
          this.damageEnemy(e, 10 * (delta / 1000));
        }
      });
    }
  }

  // ─── Utility ───────────────────────────────────────────────────────
  private gameOver(): void {
    this.phase = 'planning';
    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', { gameState: this.gs, victory: false });
    });
  }

  private floatText(text: string, x: number, y: number, color: string): void {
    const t = this.add.text(x, y, text, { fontSize: '13px', color, fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  private flashText(text: string, x: number, y: number): void {
    const t = this.add.text(x, y, text, { fontSize: '14px', color: '#ff4757', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
  }
}
