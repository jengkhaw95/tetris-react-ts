import { minMax } from './utils'

export const cellSize = 24
export const fakeCellSize = 12
export const PREVIEW_COUNT = 4
export const xCount = 10
export const yCount = 20
export const MIN_SNAPSHOT_INTERVAL = 50

export const MAX_PLAYER_PER_ROOM = 4

//export const tetrominoColors = [
//    "#f94144",
//    "#f3722c",
//    "#f8961e",
//    "#f9c74f",
//    "#90be6d",
//    "#43aa8b",
//    "#277da1",
//];

export const tetrominoColors = [
  '#4FC3F7', // Light blue
  '#1976D2', // Blue
  '#FFA726', // Orange
  '#FFEB3B', // Yellow
  '#66BB6A', // Green
  '#F06292', // Pink
  '#E53935', // Red
]

// Ref: https://tetris.fandom.com/wiki/SRS#Wall_Kicks
export const SRS = [
  {
    cw: [
      [
        [-2, 0],
        [1, 0],
        [-2, 1],
        [1, -2],
      ],
      [
        [-1, 0],
        [2, 0],
        [-1, -2],
        [2, 1],
      ],
      [
        [2, 0],
        [-1, 0],
        [2, -1],
        [-1, 2],
      ],
      [
        [1, 0],
        [-2, 0],
        [1, 2],
        [-2, -1],
      ],
    ],
    ccw: [
      [
        [-1, 0],
        [2, 0],
        [-1, -2],
        [2, 1],
      ],
      [
        [2, 0],
        [-1, 0],
        [2, -1],
        [-1, 2],
      ],
      [
        [1, 0],
        [-2, 0],
        [1, 2],
        [-2, -1],
      ],
      [
        [-2, 0],
        [1, 0],
        [-2, 1],
        [1, -2],
      ],
    ],
  }, // I
  {
    cw: [
      [
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
      ],
      [
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
      ],
      [
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ],
    ],
    ccw: [
      [
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
      ],
      [
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
      ],
      [
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ],
    ],
  }, // J, L, T, S, Z
]

export const tetrominoShapes: number[][][] = [
  // I-shape
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  // J-shape
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  // L-shape
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ],
  // O-shape
  [
    [4, 4],
    [4, 4],
  ],
  // S-shape
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ],
  // T-shape
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  // Z-shape
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ],
]

// Ref: https://tetris.wiki/Combo
export const calculateGarbageLineCountByCombo = (currentCombo: number) => {
  return minMax(Math.ceil(currentCombo / 2), 0, 4)
}
