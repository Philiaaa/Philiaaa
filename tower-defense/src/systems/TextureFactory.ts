import Phaser from 'phaser';

const T = 40;

export function generateAllTextures(scene: Phaser.Scene): void {
  makeTowerTextures(scene);
  makeEnemyTextures(scene);
  makeProjTextures(scene);
  makeMiscTextures(scene);
}

function make(
  scene: Phaser.Scene, key: string, w: number, h: number,
  fn: (g: Phaser.GameObjects.Graphics) => void
): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({}, false);
  fn(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function makeTowerTextures(scene: Phaser.Scene): void {
  // ARROW — stone watchtower with battlements
  make(scene, 'tower_arrow', T, T, g => {
    g.fillStyle(0x3d2b18);
    g.fillRoundedRect(7, 16, 26, 22, 3);
    g.fillStyle(0x5c4020);
    g.fillRect(7, 11, 7, 9);
    g.fillRect(18, 11, 7, 9);
    g.fillRect(27, 11, 6, 9);
    g.fillStyle(0x7a5a30, 0.35);
    g.fillRect(10, 17, 3, 10);
    g.fillRect(22, 17, 3, 10);
    g.fillStyle(0xf0d060);
    g.fillCircle(20, 26, 4);
    g.fillStyle(0xfff0a0, 0.6);
    g.fillCircle(19, 25, 2);
  });

  // FLAME — brazier tower
  make(scene, 'tower_flame', T, T, g => {
    g.fillStyle(0x2a1510);
    g.fillRoundedRect(9, 24, 22, 14, 3);
    g.fillStyle(0x3a2010);
    g.fillRoundedRect(11, 18, 18, 10, 2);
    g.fillStyle(0xff8800, 0.9);
    g.fillTriangle(20, 5, 12, 20, 28, 20);
    g.fillStyle(0xff4400, 0.9);
    g.fillTriangle(20, 9, 13, 20, 27, 20);
    g.fillStyle(0xffcc00, 0.9);
    g.fillTriangle(20, 13, 16, 20, 24, 20);
    g.fillStyle(0xffffff, 0.65);
    g.fillTriangle(20, 16, 18, 20, 22, 20);
  });

  // FROST — ice crystal tower
  make(scene, 'tower_frost', T, T, g => {
    g.fillStyle(0x0a1a2a);
    g.fillRoundedRect(11, 26, 18, 12, 3);
    g.fillStyle(0x1a3a5a);
    g.fillRoundedRect(13, 20, 14, 10, 2);
    g.fillStyle(0x55aadd);
    g.fillTriangle(20, 3, 12, 22, 28, 22);
    g.fillStyle(0x88ddff, 0.8);
    g.fillTriangle(20, 7, 15, 22, 25, 22);
    g.fillStyle(0xffffff, 0.6);
    g.fillTriangle(20, 11, 17, 20, 23, 20);
    g.fillStyle(0xaaeeff, 0.3);
    g.fillTriangle(20, 6, 13, 15, 20, 15);
  });

  // THUNDER — tesla coil
  make(scene, 'tower_thunder', T, T, g => {
    g.fillStyle(0x222210);
    g.fillRoundedRect(8, 22, 24, 16, 3);
    g.fillStyle(0x444420);
    g.fillRect(16, 12, 8, 12);
    g.fillStyle(0x666630);
    g.fillRect(12, 9, 16, 6);
    g.fillStyle(0xffee00);
    g.fillRect(19, 2, 3, 8);
    g.fillTriangle(24, 7, 16, 16, 22, 14);
    g.fillTriangle(18, 14, 12, 22, 20, 20);
    g.fillStyle(0xffffaa, 0.3);
    g.fillCircle(20, 5, 5);
  });

  // BOMB — mortar
  make(scene, 'tower_bomb', T, T, g => {
    g.fillStyle(0x222222);
    g.fillRoundedRect(8, 26, 24, 12, 4);
    g.fillStyle(0x333333);
    g.fillRect(13, 14, 14, 14);
    g.fillStyle(0x555555);
    g.fillRect(14, 11, 12, 6);
    g.fillStyle(0x111111);
    g.fillCircle(20, 9, 6);
    g.fillStyle(0xffffff, 0.15);
    g.fillCircle(18, 7, 2);
    g.lineStyle(2, 0x885500);
    g.beginPath();
    g.moveTo(20, 3);
    g.lineTo(26, 8);
    g.strokePath();
    g.fillStyle(0xff5500);
    g.fillCircle(26, 8, 2);
  });

  // SUPPORT — shrine
  make(scene, 'tower_support', T, T, g => {
    g.fillStyle(0x0a1a0a);
    g.fillRoundedRect(7, 16, 26, 22, 3);
    g.fillStyle(0x1a3a1a);
    g.fillRect(9, 12, 5, 14);
    g.fillRect(26, 12, 5, 14);
    g.fillStyle(0x33cc33);
    g.fillRect(17, 7, 6, 22);
    g.fillRect(9, 17, 22, 6);
    g.fillStyle(0x88ff88);
    g.fillCircle(20, 20, 5);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(18, 18, 2);
  });

  // POISON — alchemist vial
  make(scene, 'tower_poison', T, T, g => {
    g.fillStyle(0x140a1e);
    g.fillRoundedRect(9, 22, 22, 16, 4);
    g.fillStyle(0x220a36);
    g.fillRoundedRect(12, 12, 16, 14, 6);
    g.fillRect(16, 6, 8, 8);
    g.fillStyle(0x55ee11, 0.9);
    g.fillRoundedRect(13, 15, 14, 11, 5);
    g.fillStyle(0x88ff44, 0.6);
    g.fillCircle(17, 19, 2);
    g.fillCircle(23, 21, 2);
    g.fillStyle(0x6a4a2a);
    g.fillRoundedRect(16, 4, 8, 6, 2);
  });

  // DARK — gothic spire
  make(scene, 'tower_dark', T, T, g => {
    g.fillStyle(0x080010);
    g.fillRoundedRect(11, 22, 18, 16, 2);
    g.fillStyle(0x110020);
    g.fillTriangle(20, 2, 10, 22, 30, 22);
    g.fillStyle(0x7700bb, 0.65);
    g.fillTriangle(20, 6, 13, 22, 27, 22);
    g.fillStyle(0xcc00ff);
    g.fillCircle(20, 13, 4);
    g.fillStyle(0xff88ff, 0.6);
    g.fillCircle(19, 12, 2);
    g.fillStyle(0x220033);
    g.fillCircle(16, 28, 2);
    g.fillCircle(24, 28, 2);
  });
}

function makeEnemyTextures(scene: Phaser.Scene): void {
  // GRUNT r=12 → 28×28
  make(scene, 'enemy_grunt', 28, 28, g => {
    g.fillStyle(0xcc3333);
    g.fillCircle(14, 14, 13);
    g.fillStyle(0xaa2222);
    g.fillTriangle(8, 5, 4, 0, 12, 3);
    g.fillTriangle(20, 5, 16, 3, 24, 0);
    g.fillStyle(0xff5544, 0.5);
    g.fillCircle(10, 10, 5);
  });

  // BRUTE r=18 → 40×40
  make(scene, 'enemy_brute', 40, 40, g => {
    g.fillStyle(0x8b3a00);
    g.fillRoundedRect(2, 6, 36, 30, 5);
    g.fillStyle(0xcc5522);
    g.fillRoundedRect(4, 8, 32, 14, 4);
    g.fillStyle(0xee7733, 0.35);
    g.fillRect(6, 10, 10, 8);
    g.fillStyle(0x6a2a00);
    g.fillRect(2, 20, 5, 16);
    g.fillRect(33, 20, 5, 16);
  });

  // PHANTOM r=9 → 22×22
  make(scene, 'enemy_phantom', 22, 22, g => {
    g.fillStyle(0xaaaaff, 0.75);
    g.fillTriangle(11, 0, 0, 11, 11, 22);
    g.fillTriangle(11, 0, 22, 11, 11, 22);
    g.fillStyle(0xffffff, 0.4);
    g.fillTriangle(11, 3, 5, 11, 11, 11);
  });

  // HEALER r=13 → 28×28
  make(scene, 'enemy_healer', 28, 28, g => {
    g.fillStyle(0x22aa44);
    g.fillCircle(14, 14, 13);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(12, 5, 4, 18);
    g.fillRect(5, 12, 18, 4);
    g.fillStyle(0x44ff88, 0.3);
    g.fillCircle(9, 9, 5);
  });

  // SPECTER r=10 → 22×24
  make(scene, 'enemy_specter', 22, 24, g => {
    g.fillStyle(0x9966ff, 0.85);
    g.fillTriangle(11, 0, 0, 12, 11, 24);
    g.fillTriangle(11, 0, 22, 12, 11, 24);
    g.fillStyle(0xccaaff, 0.5);
    g.fillTriangle(11, 3, 5, 12, 17, 12);
  });

  // BOSS r=24 → 52×52
  make(scene, 'enemy_boss', 52, 52, g => {
    g.fillStyle(0x990000);
    g.fillCircle(26, 28, 22);
    g.fillStyle(0xffcc00);
    const spikeAngles = [-75, -45, -15, 15, 45].map(a => a * Math.PI / 180);
    for (const ang of spikeAngles) {
      const bx = 26 + Math.cos(ang - Math.PI / 2) * 20;
      const by = 28 + Math.sin(ang - Math.PI / 2) * 20;
      const mx = 26 + Math.cos(ang - Math.PI / 2) * 10;
      const my = 28 + Math.sin(ang - Math.PI / 2) * 10;
      g.fillTriangle(bx, by, mx - 4, my, mx + 4, my);
    }
    g.fillStyle(0xcc0000);
    g.fillCircle(26, 28, 17);
    g.fillStyle(0xff3333, 0.35);
    g.fillCircle(19, 22, 6);
    g.fillStyle(0xff0000, 0.9);
    g.fillCircle(20, 26, 3);
    g.fillCircle(32, 26, 3);
    g.fillStyle(0xffff00, 0.8);
    g.fillCircle(21, 25, 1.5);
    g.fillCircle(33, 25, 1.5);
  });
}

function makeProjTextures(scene: Phaser.Scene): void {
  const configs: [string, number, number][] = [
    ['proj_arrow',   0xf0d060, 4],
    ['proj_flame',   0xff6600, 5],
    ['proj_frost',   0x66ccff, 5],
    ['proj_thunder', 0xffee00, 5],
    ['proj_bomb',    0x888888, 6],
    ['proj_support', 0x88ff88, 4],
    ['proj_poison',  0x88ff22, 5],
    ['proj_dark',    0xcc44ff, 5],
  ];

  for (const [key, color, r] of configs) {
    make(scene, key, r * 2 + 6, r * 2 + 6, g => {
      const c = r + 3;
      g.fillStyle(color, 0.2);
      g.fillCircle(c, c, r + 3);
      g.fillStyle(color, 0.6);
      g.fillCircle(c, c, r + 1);
      g.fillStyle(color, 1);
      g.fillCircle(c, c, r);
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(c - 1, c - 1, Math.max(1, Math.floor(r / 2)));
    });
  }
}

function makeMiscTextures(scene: Phaser.Scene): void {
  make(scene, 'spark', 10, 10, g => {
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(5, 5, 5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(5, 5, 2);
  });
}
