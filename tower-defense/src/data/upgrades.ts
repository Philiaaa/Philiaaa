import { UpgradeDefinition, TowerType, GameState } from '../types';

function towerMod(gs: GameState, t: TowerType) {
  return gs.towerModifiers[t];
}

export const UPGRADES: UpgradeDefinition[] = [
  // ── Global ──────────────────────────────────────────────────
  {
    id: 'g_dmg',
    name: 'Puissance du Vide',
    description: 'Toutes les tours +15% dégâts',
    category: 'global', weight: 10, maxStacks: 5,
    apply: gs => { gs.globalModifiers.damageMultiplier += 0.15; },
  },
  {
    id: 'g_spd',
    name: 'Hâte Ancestrale',
    description: 'Toutes les tours attaquent +20% plus vite',
    category: 'global', weight: 10, maxStacks: 5,
    apply: gs => { gs.globalModifiers.speedMultiplier += 0.20; },
  },
  {
    id: 'g_gold',
    name: 'Grâce du Nexus',
    description: 'Ennemis lâchent +30% d\'or',
    category: 'global', weight: 8, maxStacks: 3,
    apply: gs => { gs.globalModifiers.goldMultiplier += 0.30; },
  },
  {
    id: 'g_regen',
    name: 'Régénération',
    description: 'Nexus récupère 1 HP après chaque vague',
    category: 'global', weight: 7, maxStacks: 3,
    apply: gs => { gs.globalModifiers.nexusRegenPerWave += 1; },
  },
  {
    id: 'g_near_nexus',
    name: 'Bastion du Cristal',
    description: 'Tours à ≤2 cases du Nexus : 2× dégâts',
    category: 'global', weight: 4, maxStacks: 1,
    apply: gs => { gs.globalModifiers.nearNexusDamageMultiplier = 2.0; },
  },
  {
    id: 'g_chain_kill',
    name: 'Réaction en Chaîne',
    description: 'Chaque kill a 8% de chance d\'éclair AOE',
    category: 'global', weight: 5, maxStacks: 1,
    apply: gs => { gs.globalModifiers.killChainChance += 0.08; },
  },

  // ── Arrow ────────────────────────────────────────────────────
  {
    id: 'a_multishot',
    name: 'Pluie de Flèches',
    description: 'Tour Flèche : tire 2 projectiles',
    category: 'tower', towerType: TowerType.ARROW, weight: 7, maxStacks: 1,
    apply: gs => { towerMod(gs, TowerType.ARROW).extraProjectiles += 1; },
  },
  {
    id: 'a_spd',
    name: 'Arc Runique',
    description: 'Tour Flèche : +50% vitesse d\'attaque',
    category: 'tower', towerType: TowerType.ARROW, weight: 7, maxStacks: 3,
    apply: gs => { towerMod(gs, TowerType.ARROW).speedMultiplier += 0.5; },
  },
  {
    id: 'a_dmg',
    name: 'Flèches Maudites',
    description: 'Tour Flèche : +30% dégâts',
    category: 'tower', towerType: TowerType.ARROW, weight: 7, maxStacks: 3,
    apply: gs => { towerMod(gs, TowerType.ARROW).damageMultiplier += 0.30; },
  },

  // ── Flame ────────────────────────────────────────────────────
  {
    id: 'f_pool',
    name: 'Brasier',
    description: 'Tour Flamme : sol en feu à la mort d\'ennemi',
    category: 'tower', towerType: TowerType.FLAME, weight: 5, maxStacks: 1,
    apply: gs => { towerMod(gs, TowerType.FLAME).extraEffects.push('pool'); },
  },
  {
    id: 'f_dmg',
    name: 'Feu Infernal',
    description: 'Tour Flamme : +40% dégâts',
    category: 'tower', towerType: TowerType.FLAME, weight: 7, maxStacks: 3,
    apply: gs => { towerMod(gs, TowerType.FLAME).damageMultiplier += 0.40; },
  },
  {
    id: 'f_burn',
    name: 'Combustion Prolongée',
    description: 'Tour Flamme : brûlure dure 2× plus longtemps',
    category: 'tower', towerType: TowerType.FLAME, weight: 6, maxStacks: 2,
    apply: gs => { towerMod(gs, TowerType.FLAME).specialEffectStr += 1.0; },
  },

  // ── Frost ────────────────────────────────────────────────────
  {
    id: 'fr_slow',
    name: 'Givre Profond',
    description: 'Tour Givre : ralentissement 2× plus long',
    category: 'tower', towerType: TowerType.FROST, weight: 7, maxStacks: 2,
    apply: gs => { towerMod(gs, TowerType.FROST).specialEffectStr += 1.0; },
  },
  {
    id: 'fr_range',
    name: 'Blizzard',
    description: 'Tour Givre : +50% portée',
    category: 'tower', towerType: TowerType.FROST, weight: 6, maxStacks: 2,
    apply: gs => { towerMod(gs, TowerType.FROST).rangeMultiplier += 0.5; },
  },
  {
    id: 'fr_dmg',
    name: 'Cristal Glacial',
    description: 'Tour Givre : +35% dégâts',
    category: 'tower', towerType: TowerType.FROST, weight: 6, maxStacks: 3,
    apply: gs => { towerMod(gs, TowerType.FROST).damageMultiplier += 0.35; },
  },

  // ── Thunder ──────────────────────────────────────────────────
  {
    id: 't_chain',
    name: 'Tempête',
    description: 'Tour Tonnerre : +2 cibles en chaîne',
    category: 'tower', towerType: TowerType.THUNDER, weight: 6, maxStacks: 2,
    apply: gs => { towerMod(gs, TowerType.THUNDER).extraProjectiles += 2; },
  },
  {
    id: 't_dmg',
    name: 'Foudre Divine',
    description: 'Tour Tonnerre : +35% dégâts',
    category: 'tower', towerType: TowerType.THUNDER, weight: 7, maxStacks: 3,
    apply: gs => { towerMod(gs, TowerType.THUNDER).damageMultiplier += 0.35; },
  },

  // ── Bomb ─────────────────────────────────────────────────────
  {
    id: 'b_aoe',
    name: 'Méga Bombe',
    description: 'Tour Bombe : +50% rayon d\'explosion',
    category: 'tower', towerType: TowerType.BOMB, weight: 6, maxStacks: 2,
    apply: gs => { towerMod(gs, TowerType.BOMB).rangeMultiplier += 0.5; },
  },
  {
    id: 'b_dmg',
    name: 'Explosif Runique',
    description: 'Tour Bombe : +50% dégâts',
    category: 'tower', towerType: TowerType.BOMB, weight: 7, maxStacks: 3,
    apply: gs => { towerMod(gs, TowerType.BOMB).damageMultiplier += 0.50; },
  },

  // ── Support ──────────────────────────────────────────────────
  {
    id: 's_range',
    name: 'Aura Étendue',
    description: 'Tour Support : rayon 2× plus grand',
    category: 'tower', towerType: TowerType.SUPPORT, weight: 6, maxStacks: 2,
    apply: gs => { towerMod(gs, TowerType.SUPPORT).rangeMultiplier += 1.0; },
  },
  {
    id: 's_buff',
    name: 'Catalyseur',
    description: 'Tour Support : bonus +20% supplémentaire',
    category: 'tower', towerType: TowerType.SUPPORT, weight: 5, maxStacks: 3,
    apply: gs => { towerMod(gs, TowerType.SUPPORT).specialEffectStr += 0.20; },
  },

  // ── Poison ───────────────────────────────────────────────────
  {
    id: 'p_stacks',
    name: 'Venin Concentré',
    description: 'Tour Poison : 2× stacks de poison',
    category: 'tower', towerType: TowerType.POISON, weight: 7, maxStacks: 2,
    apply: gs => { towerMod(gs, TowerType.POISON).specialEffectStr += 3; },
  },
  {
    id: 'p_dmg',
    name: 'Toxine Mortelle',
    description: 'Tour Poison : +40% dégâts',
    category: 'tower', towerType: TowerType.POISON, weight: 7, maxStacks: 3,
    apply: gs => { towerMod(gs, TowerType.POISON).damageMultiplier += 0.40; },
  },

  // ── Dark ─────────────────────────────────────────────────────
  {
    id: 'd_steal',
    name: 'Gouffre Vampire',
    description: 'Tour Sombre : vol de vie +10%',
    category: 'tower', towerType: TowerType.DARK, weight: 5, maxStacks: 2,
    apply: gs => { towerMod(gs, TowerType.DARK).specialEffectStr += 0.10; },
  },
  {
    id: 'd_dmg',
    name: 'Abîme Sans Fond',
    description: 'Tour Sombre : +50% dégâts',
    category: 'tower', towerType: TowerType.DARK, weight: 7, maxStacks: 3,
    apply: gs => { towerMod(gs, TowerType.DARK).damageMultiplier += 0.50; },
  },

  // ── Special ──────────────────────────────────────────────────
  {
    id: 'sp_gold',
    name: 'Pluie d\'Or',
    description: 'Gagnez immédiatement 60 or',
    category: 'special', weight: 5, maxStacks: 99,
    apply: gs => { gs.gold += 60; },
  },
  {
    id: 'sp_heal',
    name: 'Restauration du Nexus',
    description: 'Le Nexus récupère 4 HP immédiatement',
    category: 'special', weight: 6, maxStacks: 99,
    apply: gs => { gs.nexusHp = Math.min(gs.maxNexusHp, gs.nexusHp + 4); },
  },
  {
    id: 'sp_max_hp',
    name: 'Fortification du Nexus',
    description: 'HP maximum du Nexus +5',
    category: 'special', weight: 4, maxStacks: 4,
    apply: gs => { gs.maxNexusHp += 5; gs.nexusHp = Math.min(gs.nexusHp + 5, gs.maxNexusHp); },
  },
];
