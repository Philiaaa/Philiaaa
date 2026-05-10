export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 500;

export const TILE_SIZE = 40;
export const GRID_COLS = 15;
export const GRID_ROWS = 10;

export const GRID_X = 0;
export const GRID_Y = 50;

export const GRID_PX_W = GRID_COLS * TILE_SIZE; // 600
export const GRID_PX_H = GRID_ROWS * TILE_SIZE; // 400

export const RIGHT_PANEL_X = GRID_PX_W;           // 600
export const RIGHT_PANEL_W = GAME_WIDTH - GRID_PX_W; // 200

export const HUD_H = GRID_Y; // 50

export const STARTING_NEXUS_HP = 20;

export const C = {
  bg:           0x1a1a2e,
  gridEmpty:    0x252540,
  gridPath:     0x3d2b1f,
  gridBorder:   0x3a3a5c,
  nexusTile:    0x0d1b3e,
  nexusGlow:    0x00d4ff,
  hudBg:        0x0f0f1e,
  panelBg:      0x16213e,
  panelBorder:  0x2a3a6e,
  gold:         0xffd700,
  hp:           0xff4757,
  hpGreen:      0x2ecc71,
  waveColor:    0x2ed573,
  white:        0xffffff,
  btnGreen:     0x1a7a4a,
  btnBlue:      0x1a4a7a,
  btnRed:       0x7a1a1a,
  dimWhite:     0xaaaacc,
  spawnTile:    0x4a1a1a,
} as const;
