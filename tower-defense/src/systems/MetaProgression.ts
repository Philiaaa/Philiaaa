// Meta-progression stored in localStorage.
// Tracks best wave, total runs, total kills, and unlocked hints.

export interface MetaData {
  totalRuns: number;
  bestWave: number;
  totalKills: number;
  totalGoldEarned: number;
  classWins: Record<string, number>;
}

const KEY = 'nexus-rift-meta';

export function loadMeta(): MetaData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as MetaData;
  } catch (_) { /* ignore */ }
  return { totalRuns: 0, bestWave: 0, totalKills: 0, totalGoldEarned: 0, classWins: {} };
}

export function saveMeta(data: MetaData): void {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) { /* ignore */ }
}

export function recordRunEnd(wave: number, kills: number, goldEarned: number, classId: string): MetaData {
  const meta = loadMeta();
  meta.totalRuns += 1;
  meta.bestWave = Math.max(meta.bestWave, wave);
  meta.totalKills += kills;
  meta.totalGoldEarned += goldEarned;
  meta.classWins[classId] = (meta.classWins[classId] || 0) + 1;
  saveMeta(meta);
  return meta;
}
