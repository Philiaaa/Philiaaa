import { WardClass, TowerType, GameState, TowerModifier, GlobalModifier } from '../types';

export const WARD_CLASSES: WardClass[] = [
  {
    id: 'fire',
    name: 'Gardien du Feu',
    description: 'Maître des flammes. Commence avec 2 Tours Flamme. +25% dégâts de feu.',
    startingTowers: [TowerType.FLAME, TowerType.FLAME, TowerType.ARROW],
    startingGold: 80,
    bonus: '+25% dégâts Flamme',
    color: 0xe74c3c,
  },
  {
    id: 'frost',
    name: 'Gardien du Givre',
    description: 'La glace paralyse les envahisseurs. Commence avec 2 Tours Givre. Ennemis démarrent ralentis.',
    startingTowers: [TowerType.FROST, TowerType.FROST, TowerType.ARROW],
    startingGold: 80,
    bonus: '+35% durée ralentissement',
    color: 0x74b9ff,
  },
  {
    id: 'void',
    name: 'Gardien du Vide',
    description: 'Le vide dévore tout. Commence avec 1 Tour Sombre. +15% or par kill.',
    startingTowers: [TowerType.DARK, TowerType.ARROW, TowerType.ARROW],
    startingGold: 110,
    bonus: '+15% or par kill',
    color: 0xa29bfe,
  },
  {
    id: 'nature',
    name: 'Gardien Nature',
    description: 'La nature protège. Commence avec 3 Tours Flèche. Nexus régénère 1 HP/vague dès le départ.',
    startingTowers: [TowerType.ARROW, TowerType.ARROW, TowerType.ARROW],
    startingGold: 130,
    bonus: 'Nexus régénère 1 HP/vague',
    color: 0x00b894,
  },
];

function defaultTowerMod(): TowerModifier {
  return {
    damageMultiplier: 1.0,
    speedMultiplier: 1.0,
    rangeMultiplier: 1.0,
    extraProjectiles: 0,
    specialEffectStr: 0,
    extraEffects: [],
  };
}

function defaultGlobalMod(): GlobalModifier {
  return {
    goldMultiplier: 1.0,
    damageMultiplier: 1.0,
    speedMultiplier: 1.0,
    nexusRegenPerWave: 0,
    killChainChance: 0,
    nearNexusDamageMultiplier: 1.0,
  };
}

import { TowerType as TT } from '../types';
import { STARTING_NEXUS_HP } from '../config';

export function buildInitialGameState(classId: string): GameState {
  const cls = WARD_CLASSES.find(c => c.id === classId)!;

  const towerModifiers = {} as Record<TowerType, TowerModifier>;
  for (const t of Object.values(TT)) {
    towerModifiers[t] = defaultTowerMod();
  }

  const globalModifiers = defaultGlobalMod();

  // Apply class bonuses
  if (classId === 'fire') {
    towerModifiers[TT.FLAME].damageMultiplier = 1.25;
  } else if (classId === 'frost') {
    towerModifiers[TT.FROST].specialEffectStr = 0.35;
  } else if (classId === 'void') {
    globalModifiers.goldMultiplier = 1.15;
  } else if (classId === 'nature') {
    globalModifiers.nexusRegenPerWave = 1;
  }

  return {
    gold: cls.startingGold,
    nexusHp: STARTING_NEXUS_HP,
    maxNexusHp: STARTING_NEXUS_HP,
    wave: 0,
    score: 0,
    className: cls.name,
    classId,
    appliedUpgrades: [],
    towerModifiers,
    globalModifiers,
  };
}
