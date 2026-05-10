// Procedural audio using Web Audio API — no external files needed.
// Each sound is generated from oscillators and noise.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  freq: number, duration: number, type: OscillatorType = 'sine',
  gain = 0.15, fadeOut = true
): void {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gainNode.gain.setValueAtTime(gain, ac.currentTime);
    if (fadeOut) gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (_) { /* Audio not available */ }
}

function playNoise(duration: number, gain = 0.1, freq = 800): void {
  try {
    const ac = getCtx();
    const bufSize = ac.sampleRate * duration;
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.5;
    const gainNode = ac.createGain();
    gainNode.gain.setValueAtTime(gain, ac.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    src.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ac.destination);
    src.start();
    src.stop(ac.currentTime + duration);
  } catch (_) { /* Audio not available */ }
}

export const Sfx = {
  towerPlace(): void {
    playTone(440, 0.12, 'square', 0.12);
    setTimeout(() => playTone(660, 0.1, 'square', 0.08), 60);
  },
  towerShootArrow(): void { playTone(880, 0.06, 'sawtooth', 0.06); },
  towerShootFlame(): void { playNoise(0.08, 0.08, 400); },
  towerShootFrost(): void { playTone(1200, 0.1, 'sine', 0.07); },
  towerShootThunder(): void {
    playNoise(0.04, 0.15, 1200);
    setTimeout(() => playTone(200, 0.08, 'sawtooth', 0.1), 20);
  },
  towerShootBomb(): void { playNoise(0.06, 0.1, 300); },
  enemyDeath(): void { playTone(200, 0.12, 'sawtooth', 0.08); },
  enemyHitNexus(): void {
    playNoise(0.15, 0.2, 150);
    playTone(100, 0.2, 'square', 0.15);
  },
  bossSpawn(): void {
    playTone(80, 0.5, 'sawtooth', 0.2);
    setTimeout(() => playTone(60, 0.4, 'sawtooth', 0.15), 300);
  },
  waveStart(): void {
    playTone(330, 0.1, 'square', 0.1);
    setTimeout(() => playTone(440, 0.1, 'square', 0.1), 100);
    setTimeout(() => playTone(550, 0.15, 'square', 0.12), 200);
  },
  upgradeSelect(): void {
    playTone(660, 0.08, 'sine', 0.12);
    setTimeout(() => playTone(880, 0.12, 'sine', 0.1), 80);
  },
  insufficientGold(): void { playTone(180, 0.15, 'square', 0.1); },
  chainLightning(): void {
    playNoise(0.05, 0.2, 2000);
    playTone(1500, 0.06, 'sawtooth', 0.1);
  },
  gameOver(): void {
    playTone(220, 0.3, 'sawtooth', 0.15);
    setTimeout(() => playTone(180, 0.3, 'sawtooth', 0.12), 250);
    setTimeout(() => playTone(130, 0.5, 'sawtooth', 0.1), 500);
  },
  sellTower(): void {
    playTone(330, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(250, 0.12, 'sine', 0.08), 80);
  },
};
