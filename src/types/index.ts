export interface Tetromino {
  shape: number[][];
  x: number;
  y: number;
  color: string;
  key: number;
  rotation: number;
}
export interface GameSnapshot {
  map: number[][];
  tetromino: Tetromino;
  shadow: Tetromino;
  swap: number | null;
  seeds: number[];
  pendingGarbageLineCount: number;
}
