export enum TowerType {
  ARROW = 'arrow',
  FLAME = 'flame',
  FROST = 'frost',
  THUNDER = 'thunder',
  BOMB = 'bomb',
  SUPPORT = 'support',
  POISON = 'poison',
  DARK = 'dark',
}

export enum EnemyType {
  GRUNT = 'grunt',
  BRUTE = 'brute',
  PHANTOM = 'phantom',
  HEALER = 'healer',
  SPECTER = 'specter',
  BOSS = 'boss',
}

export type TileType = 'empty' | 'path' | 'tower' | 'nexus' | 'spawn';

export interface PathNode {
  col: number;
  row: number;
}

export interface TowerStats {
  type: TowerType;
  name: string;
  cost: number;
  damage: number;
  range: number;
  attackSpeed: number;
  color: number;
  description: string;
  special?: string;
  specialValue?: number;
}

export interface EnemyStats {
  type: EnemyType;
  name: string;
  hp: number;
  speed: number;
  reward: number;
  damage: number;
  color: number;
  radius: number;
  isBoss?: boolean;
}

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'tower' | 'global' | 'special';
  towerType?: TowerType;
  weight: number;
  maxStacks: number;
  apply: (gs: GameState) => void;
}

export interface TowerModifier {
  damageMultiplier: number;
  speedMultiplier: number;
  rangeMultiplier: number;
  extraProjectiles: number;
  specialEffectStr: number;
  extraEffects: string[];
}

export interface GlobalModifier {
  goldMultiplier: number;
  damageMultiplier: number;
  speedMultiplier: number;
  nexusRegenPerWave: number;
  killChainChance: number;
  nearNexusDamageMultiplier: number;
}

export interface GameState {
  gold: number;
  nexusHp: number;
  maxNexusHp: number;
  wave: number;
  score: number;
  className: string;
  classId: string;
  appliedUpgrades: string[];
  towerModifiers: Record<TowerType, TowerModifier>;
  globalModifiers: GlobalModifier;
}

export interface WardClass {
  id: string;
  name: string;
  description: string;
  startingTowers: TowerType[];
  startingGold: number;
  bonus: string;
  color: number;
}

export interface WaveSpawn {
  type: EnemyType;
  count: number;
  interval: number;
}

export interface WaveDefinition {
  spawns: WaveSpawn[];
  bonusGold: number;
}

export interface TowerInstance {
  col: number;
  row: number;
  type: TowerType;
  cooldown: number;
  body: Phaser.GameObjects.Image;
  innerDot?: Phaser.GameObjects.Arc;
  rangeIndicator: Phaser.GameObjects.Arc;
}

export interface EnemyInstance {
  id: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  pathIdx: number;
  subProgress: number;
  slowFactor: number;
  slowMs: number;
  burnDps: number;
  burnMs: number;
  poisonStacks: number;
  poisonTickMs: number;
  isDead: boolean;
  hitNexus: boolean;
  healTimer: number;
  body: Phaser.GameObjects.Image;
  hpBarBg: Phaser.GameObjects.Rectangle;
  hpBarFg: Phaser.GameObjects.Rectangle;
  bossText?: Phaser.GameObjects.Text;
  statusIcon?: Phaser.GameObjects.Text;
}

export interface ProjectileInstance {
  targetId: number;
  damage: number;
  special?: string;
  specialVal?: number;
  aoeRadius?: number;
  body: Phaser.GameObjects.Image;
  active: boolean;
}
