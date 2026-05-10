import { UpgradeDefinition, GameState } from '../types';
import { UPGRADES } from '../data/upgrades';

export function selectUpgrades(gs: GameState, count = 3): UpgradeDefinition[] {
  const stackCounts: Record<string, number> = {};
  for (const id of gs.appliedUpgrades) {
    stackCounts[id] = (stackCounts[id] || 0) + 1;
  }

  const pool = UPGRADES.filter(u => (stackCounts[u.id] || 0) < u.maxStacks);

  const chosen: UpgradeDefinition[] = [];
  const remaining = [...pool];

  while (chosen.length < count && remaining.length > 0) {
    const total = remaining.reduce((s, u) => s + u.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < remaining.length; i++) {
      r -= remaining[i].weight;
      if (r <= 0) { idx = i; break; }
    }
    chosen.push(remaining[idx]);
    remaining.splice(idx, 1);
  }

  return chosen;
}

export function applyUpgrade(gs: GameState, upgrade: UpgradeDefinition): void {
  upgrade.apply(gs);
  gs.appliedUpgrades.push(upgrade.id);
}
