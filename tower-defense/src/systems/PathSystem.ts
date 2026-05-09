import { PathNode } from '../types';
import { GRID_COLS, GRID_ROWS, TILE_SIZE, GRID_X, GRID_Y } from '../config';

export function generatePath(): PathNode[] {
  const cols = GRID_COLS;
  const rows = GRID_ROWS;
  const visited = new Set<string>();

  const startRow = 1 + Math.floor(Math.random() * (rows - 2));
  const path: PathNode[] = [];

  let col = 0;
  let row = startRow;

  path.push({ col, row });
  visited.add(`${col},${row}`);

  while (col < cols - 1) {
    // Weight: right = 3x, up/down = 1x each
    const opts: [number, number][] = [];

    if (!visited.has(`${col + 1},${row}`)) {
      opts.push([1, 0], [1, 0], [1, 0]);
    }
    if (row > 1 && !visited.has(`${col},${row - 1}`)) {
      opts.push([0, -1]);
    }
    if (row < rows - 2 && !visited.has(`${col},${row + 1}`)) {
      opts.push([0, 1]);
    }

    if (opts.length === 0) {
      // Stuck: force right
      col++;
      if (col < cols) { path.push({ col, row }); visited.add(`${col},${row}`); }
      continue;
    }

    const [dc, dr] = opts[Math.floor(Math.random() * opts.length)];
    col += dc;
    row += dr;
    path.push({ col, row });
    visited.add(`${col},${row}`);
  }

  return path;
}

export function pathToPixels(path: PathNode[]): { x: number; y: number }[] {
  return path.map(n => ({
    x: GRID_X + n.col * TILE_SIZE + TILE_SIZE / 2,
    y: GRID_Y + n.row * TILE_SIZE + TILE_SIZE / 2,
  }));
}

export function buildGrid(path: PathNode[]): string[][] {
  const grid: string[][] = Array.from({ length: GRID_ROWS }, () =>
    new Array(GRID_COLS).fill('empty')
  );

  for (let i = 0; i < path.length; i++) {
    const { col, row } = path[i];
    if (i === 0) {
      grid[row][col] = 'spawn';
    } else if (i === path.length - 1) {
      grid[row][col] = 'nexus';
    } else {
      grid[row][col] = 'path';
    }
  }

  return grid;
}
