import { EnemyType, WaveDefinition } from '../types';

export function generateWave(waveNum: number): WaveDefinition {
  const isBoss = waveNum % 5 === 0;
  const d = waveNum;

  if (isBoss) {
    return {
      spawns: [
        { type: EnemyType.BOSS, count: 1, interval: 999 },
        { type: EnemyType.GRUNT, count: Math.floor(d * 1.5) + 3, interval: 0.7 },
      ],
      bonusGold: 60 + d * 10,
    };
  }

  const spawns: WaveDefinition['spawns'] = [];

  // Grunts always present
  spawns.push({
    type: EnemyType.GRUNT,
    count: Math.max(4, Math.floor(d * 2.5)),
    interval: Math.max(0.3, 1.4 - d * 0.04),
  });

  if (d >= 2) {
    spawns.push({ type: EnemyType.PHANTOM, count: Math.floor(d * 0.8) + 1, interval: 0.5 });
  }
  if (d >= 3) {
    spawns.push({ type: EnemyType.BRUTE, count: Math.floor(d * 0.4) + 1, interval: 2.5 });
  }
  if (d >= 5) {
    spawns.push({ type: EnemyType.HEALER, count: Math.floor(d * 0.35) + 1, interval: 1.8 });
  }
  if (d >= 7) {
    spawns.push({ type: EnemyType.SPECTER, count: Math.floor(d * 0.5) + 1, interval: 0.6 });
  }

  return {
    spawns,
    bonusGold: 20 + d * 6,
  };
}
