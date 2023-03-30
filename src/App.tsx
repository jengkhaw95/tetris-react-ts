import {useEffect, useRef, useState} from "react";
import "./App.css";

//const TILES = new Array(20).fill((_: any) => new Array(10).fill(0));

interface Tetromino {
  shape: number[][];
  x: number;
  y: number;
  color: string;
  key: number;
  rotation: number;
}
const cellSize = 24;
const PREVIEW_COUNT = 4;
const xCount = 10;
const yCount = 20;

const tetrominoColors = [
  "#f94144",
  "#f3722c",
  "#f8961e",
  "#f9c74f",
  "#90be6d",
  "#43aa8b",
  "#277da1",
];

// Ref: https://tetris.fandom.com/wiki/SRS#Wall_Kicks
const SRS = [
  {
    cw: [
      [
        [-2, 0],
        [1, 0],
        [-2, -1],
        [1, 2],
      ],
      [
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1],
      ],
      [
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2],
      ],
      [
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1],
      ],
    ],
    ccw: [
      [
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2],
      ],
      [
        [1, 0],
        [-2, 0],
        [1, -2],
        [-2, 1],
      ],
      [
        [-2, 0],
        [1, 0],
        [-2, -1],
        [1, 2],
      ],
      [
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1],
      ],
    ],
  }, // I
  {
    cw: [
      [
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ],
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
    ],
    ccw: [
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
    ],
  }, // J, L, T, S, Z
];

function getSrsByIndex(key: number) {
  return key === 0 ? SRS[0] : SRS[1];
}

const tetrominoShapes: number[][][] = [
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
];

function minMax(value: number, min: number, max: number) {
  return Math.min(max, Math.max(value, min));
}

function generateSeeds(iteration = 1) {
  const result = [];
  while (iteration > 0) {
    const pool = Array.from(new Array(7), (_, i) => i);
    while (pool.length > 0) {
      const r = Math.floor(Math.random() * pool.length);
      result.push(pool[r]);
      pool.splice(r, 1);
    }
    iteration--;
  }
  return result;
}
function generateTetromino(index: number): Tetromino {
  const randomShape = tetrominoShapes[index];
  const tetromino: Tetromino = {
    shape: randomShape,
    x: Math.floor((10 - randomShape.length) / 2),
    y: 0,
    key: index,
    rotation: 0,
    color: tetrominoColors[index],
  };
  return tetromino;
}

//function generateRandomTetromino(): Tetromino {
//  const randomIndex = Math.floor(Math.random() * tetrominoShapes.length);
//  const randomShape = tetrominoShapes[randomIndex];
//  const tetromino: Tetromino = {
//    shape: randomShape,
//    x: 0,
//    y: 0,
//    color: tetrominoColors[randomIndex],
//  };
//  return tetromino;
//}

function getShadow(tetromino: Tetromino, map: number[][]): Tetromino {
  const tempPiece = structuredClone(tetromino) as Tetromino;
  tempPiece.shape = tempPiece.shape.map((y) => y.map((n) => (n ? -2 : 0)));
  let isCollided = false;
  while (!isCollided) {
    tempPiece.y++;
    isCollided = checkCollision(map, tempPiece);
  }
  tempPiece.y--;

  return tempPiece;
}

function checkCollision(board: number[][], tetromino: Tetromino): boolean {
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      // Check if the block in the Tetromino's shape is non-zero
      if (tetromino.shape[y][x] !== 0) {
        const boardX = tetromino.x + x;
        const boardY = tetromino.y + y;

        // Check if the block is outside the board boundaries
        if (boardX < 0 || boardX >= board[0].length || boardY >= board.length) {
          return true;
        }

        // Check if the block overlaps with a non-zero block on the board
        if (boardY >= 0 && board[boardY][boardX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

function moveTetromino(
  piece: Tetromino,
  mode: "right" | "left" | "rotateCw" | "rotateCcw" | "drop" | "hardDrop",
  map: number[][]
): [Tetromino, boolean | undefined, boolean | undefined] {
  let toSolidate = false;
  let isKicked = false;

  switch (mode) {
    case "right": {
      const tempPiece = structuredClone(piece) as typeof piece;
      tempPiece.x++;
      tempPiece.y;

      if (!checkCollision(map, tempPiece)) {
        return [tempPiece, toSolidate, isKicked];
      }
      return [piece, toSolidate, isKicked];
    }
    case "left": {
      const tempPiece = structuredClone(piece) as typeof piece;
      tempPiece.x--;
      tempPiece.y;

      if (!checkCollision(map, tempPiece)) {
        return [tempPiece, toSolidate, isKicked];
      }
      return [piece, toSolidate, isKicked];
    }
    case "drop": {
      const tempPiece = structuredClone(piece) as typeof piece;
      tempPiece.y++;

      if (!checkCollision(map, tempPiece)) {
        return [tempPiece, toSolidate, isKicked];
      }
      toSolidate = true;
      return [piece, toSolidate, isKicked];
    }
    case "hardDrop": {
      const tempPiece = structuredClone(piece) as typeof piece;
      let isCollided = false;
      while (!isCollided) {
        tempPiece.y++;
        isCollided = checkCollision(map, tempPiece);
      }
      tempPiece.y--;
      toSolidate = true;
      return [tempPiece, toSolidate, isKicked];
    }
    case "rotateCw": {
      const tempPiece = structuredClone(piece) as typeof piece;
      const size = tempPiece.shape.length;
      const shape = tempPiece.shape;
      const newShape = Array(size)
        .fill(0)
        .map(() => Array(size).fill(0));
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          newShape[x][y] = shape[size - 1 - y][x];
        }
      }
      tempPiece.shape = newShape;
      tempPiece.rotation = (tempPiece.rotation + 1) % 4;

      // SRS check
      const {cw} = getSrsByIndex(tempPiece.key);

      let rotatedResult = piece;
      if (!checkCollision(map, tempPiece)) {
        // If normal rotion works, use it
        return [tempPiece, toSolidate, isKicked];
      } else {
        // Test for all SRS
        for (let srs of cw[piece.rotation]) {
          const tempPiece2 = structuredClone(tempPiece) as typeof piece;
          const [dx, dy] = srs;
          tempPiece2.x += dx;
          tempPiece2.y -= dy;
          if (!checkCollision(map, tempPiece2)) {
            // One of the SRS works, so use this.
            isKicked = true;
            rotatedResult = tempPiece2;
            break;
          }
        }
        return [rotatedResult, toSolidate, isKicked];
      }
    }
    case "rotateCcw": {
      const tempPiece = structuredClone(piece) as typeof piece;
      const size = tempPiece.shape.length;
      const shape = tempPiece.shape;
      const newShape = Array(size)
        .fill(0)
        .map(() => Array(size).fill(0));
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          newShape[x][y] = shape[size - 1 - y][x];
        }
      }
      tempPiece.shape = newShape;
      tempPiece.rotation = (tempPiece.rotation + 1) % 4;

      // SRS check
      const {ccw} = getSrsByIndex(tempPiece.key);

      let rotatedResult = piece;
      if (!checkCollision(map, tempPiece)) {
        // If normal rotion works, use it
        return [tempPiece, toSolidate, isKicked];
      } else {
        // Test for all SRS
        for (let srs of ccw[piece.rotation]) {
          const tempPiece2 = structuredClone(tempPiece) as typeof piece;
          const [dx, dy] = srs;
          tempPiece2.x += dx;
          tempPiece2.y -= dy;
          if (!checkCollision(map, tempPiece2)) {
            // One of the SRS works, so use this.
            isKicked = true;
            rotatedResult = tempPiece2;
            break;
          }
        }
        return [rotatedResult, toSolidate, isKicked];
      }
    }

    default:
      return [piece, toSolidate, isKicked];
  }
}

function solidate(tetromino: Tetromino, map: number[][], isShadow?: boolean) {
  const {x, y, shape} = tetromino;
  const newMap = structuredClone(map) as number[][];

  for (let j in shape) {
    const s = newMap[j];
    for (let i in s) {
      const check = shape[j][i];
      if (check) {
        newMap[y + Number(j)][x + Number(i)] = isShadow ? -2 : check;
      }
    }
  }

  const removingIndex: number[] = [];
  for (let j in newMap) {
    let c = 0;
    for (let i of newMap[j]) {
      if (i !== 0) {
        c++;
      }
      if (c === 10) {
        removingIndex.push(Number(j));
      }
    }
  }
  for (let i of removingIndex) {
    newMap.splice(i, 1);
    newMap.unshift(Array(xCount).fill(0));
  }

  return newMap;
}

function makeNewMap() {
  return Array.from(new Array(yCount), (_, i) => {
    const r = i < 120 ? -1 : Math.floor(Math.random() * 10);
    return Array.from(new Array(xCount), (_, j) =>
      r < 0 ? 0 : j !== r ? -1 : 0
    );
  });
}

const useTetrisEngine = () => {
  const gameStartTimestamp = useRef<number>(Date.now());
  const intervalRef = useRef<number>();
  const lastY = useRef<number>();
  const timestampRef = useRef<number>(0);
  const [seeds, setSeeds] = useState<number[]>(generateSeeds(2));
  const [isGameOver, setIsGameOver] = useState(false);
  const [map, setMap] = useState<number[][]>(() => makeNewMap());
  const [swap, setSwap] = useState<number | null>(null);
  const [tetromino, setTetromino] = useState(() => generateTetromino(seeds[0]));
  const [shadow, setShadow] = useState(tetromino);

  const speed = 0.1 || (Date.now() - gameStartTimestamp.current) / 30_000;

  const resetMap = () => {
    setIsGameOver(false);
    setMap(makeNewMap());
    gameStartTimestamp.current = Date.now();
  };
  const regenerateTetromino = () => {
    setIsGameOver(false);
    setSeeds(generateSeeds(2));
    setSwap(null);
  };
  const nextTetromino = () => {
    setIsGameOver(false);
    setSeeds((s) => {
      const [_, ...k] = s;
      if (k.length <= 8) {
        return [...k, ...generateSeeds()];
      }
      return k;
    });
    const nextTetromino = generateTetromino(seeds[0]);
    if (checkCollision(map, nextTetromino)) {
      setIsGameOver(true);
      resetMap();
      regenerateTetromino();
    } else {
      setTetromino(nextTetromino);
    }
  };

  // Ref: https://strategywiki.org/wiki/Tetris/Controls
  function keyboardControl(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight": {
        const [newTetromino] = moveTetromino(tetromino, "right", map);
        setTetromino(newTetromino);
        break;
      }
      case "ArrowLeft": {
        const [newTetromino] = moveTetromino(tetromino, "left", map);
        setTetromino(newTetromino);
        break;
      }
      case "x":
      case "X":
      case "ArrowUp": {
        const [newTetromino] = moveTetromino(tetromino, "rotateCw", map);
        setTetromino(newTetromino);
        break;
      }
      case "z":
      case "Z":
      case "Meta":
      case "Control": {
        const [newTetromino] = moveTetromino(tetromino, "rotateCcw", map);
        setTetromino(newTetromino);
        break;
      }
      case "ArrowDown": {
        const [newTetromino, toSolidate] = moveTetromino(
          tetromino,
          "drop",
          map
        );
        if (toSolidate) {
          setMap(solidate(newTetromino, map));
          nextTetromino();
        } else {
          setTetromino(newTetromino);
        }

        break;
      }
      case " ": {
        const [newTetromino, toSolidate] = moveTetromino(
          tetromino,
          "hardDrop",
          map
        );
        if (toSolidate) {
          setMap(solidate(newTetromino, map));
          nextTetromino();
        } else {
          setTetromino(newTetromino);
        }
        break;
      }
      case "c":
      case "C":
      case "Shift": {
        e.preventDefault();
        if (swap === null) {
          setSwap(seeds[0]);
          nextTetromino();
        } else {
          setSwap(seeds[0]);
          setSeeds((s) => {
            const [_, ...k] = s;
            return [swap, ...k];
          });
        }
      }

      default:
        break;
    }
  }

  useEffect(() => {
    setTetromino(generateTetromino(seeds[0]));
  }, [seeds]);

  useEffect(() => {
    setShadow(getShadow(tetromino, map));
  }, [tetromino, map]);

  useEffect(() => {
    if (isGameOver) {
      return;
    }
    const now = Date.now();
    if (tetromino.y !== lastY.current) {
      timestampRef.current = now;
    }
    lastY.current = tetromino.y;
    intervalRef.current = setInterval(() => {
      const [newTetromino, toSolidate] = moveTetromino(tetromino, "drop", map);
      if (toSolidate) {
        setMap(solidate(newTetromino, map));
        nextTetromino();
      } else {
        setTetromino(newTetromino);
      }
    }, minMax(1000 / speed, 150, 1000) - now + timestampRef.current);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [tetromino, isGameOver]);

  useEffect(() => {
    window.addEventListener("keydown", keyboardControl);
    return () => {
      window.removeEventListener("keydown", keyboardControl);
    };
  }, [keyboardControl]);

  return {
    map,
    keyboardControl,
    resetMap,
    regenerateTetromino,
    tetromino,
    shadow,
    seeds,
    swap,
  };
};

function App() {
  const {map, resetMap, regenerateTetromino, tetromino, shadow, seeds, swap} =
    useTetrisEngine();
  return (
    <div>
      <div className="flex justify-center items-center gap-4">
        <button
          className="my-2 px-4 py-2 rounded bg-indigo-500 text-white text-sm"
          onClick={(e) => {
            resetMap();
            e.currentTarget.blur();
          }}
        >
          Reset Map
        </button>
        <button
          className="my-2 px-4 py-2 rounded bg-indigo-500 text-white text-sm"
          onClick={(e) => {
            regenerateTetromino();
            e.currentTarget.blur();
          }}
        >
          New piece
        </button>
      </div>
      <div className="flex gap-4 justify-center mx-auto">
        <div
          className="flex items-center justify-center"
          style={{
            width: `${cellSize * 4}px`,
            height: `${cellSize * 4}px`,
          }}
        >
          {swap !== null ? <Tetromino index={swap} /> : null}
        </div>
        <div
          className="grid grid-cols-10 border"
          style={{
            width: `${cellSize * xCount}px`,
            height: `${cellSize * yCount}px`,
          }}
        >
          {map.map((m, y) =>
            m.map((n, x) => {
              const isTetrominoInRange =
                y - tetromino.y >= 0 &&
                y - tetromino.y < tetromino.shape.length &&
                x - tetromino.x >= 0 &&
                x - tetromino.x < tetromino.shape[0].length;
              const isShadowInRange =
                y - shadow.y >= 0 &&
                y - shadow.y < shadow.shape.length &&
                x - shadow.x >= 0 &&
                x - shadow.x < shadow.shape[0].length;
              const isTetromino =
                isTetrominoInRange &&
                tetromino.shape[y - tetromino.y][x - tetromino.x] > 0;
              const isShadow =
                isShadowInRange &&
                shadow.shape[y - shadow.y][x - shadow.x] === -2;
              return (
                <div
                  key={`${x}-${y}`}
                  data-test={`${x}-${y}`}
                  style={{
                    backgroundColor:
                      isTetromino || isShadow
                        ? tetromino.color
                        : n > 0
                        ? tetrominoColors[n - 1]
                        : "",
                    opacity: isShadow && !isTetromino ? ".35" : "",
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                  }}
                ></div>
              );
            })
          )}
        </div>
        <div className="flex flex-col gap-4 items-center">
          {seeds.slice(1, PREVIEW_COUNT + 1).map((s, i) => (
            <Tetromino key={i} index={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Tetromino({index}: {index: number}) {
  const tetromino = generateTetromino(index);
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: `${cellSize * 4}px`,
        height: `${cellSize * 4}px`,
      }}
    >
      <div
        className="grid items-center justify-center"
        style={{
          gridTemplateColumns: `repeat(${tetromino.shape.length}, ${cellSize}px)`,
        }}
      >
        {tetromino.shape.map((m) =>
          m.map((n, i) => (
            <div
              key={i}
              style={{
                backgroundColor: n ? tetromino.color : "",
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
            ></div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
