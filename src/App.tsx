import {Link, Outlet} from "react-router-dom";
import {Toaster} from "react-hot-toast";
// import "./App.css";

// function minMax(value: number, min: number, max: number) {
//   return Math.min(max, Math.max(value, min));
// }

// function generateSeeds(iteration = 1) {
//   const result = [];
//   while (iteration > 0) {
//     const pool = Array.from(new Array(7), (_, i) => i);
//     while (pool.length > 0) {
//       const r = Math.floor(Math.random() * pool.length);
//       result.push(pool[r]);
//       pool.splice(r, 1);
//     }
//     iteration--;
//   }
//   return result;
// }
// function generateTetromino(index: number): Tetromino {
//   const randomShape = tetrominoShapes[index];
//   const tetromino: Tetromino = {
//     shape: randomShape,
//     x: Math.floor((10 - randomShape.length) / 2),
//     y: 0,
//     key: index,
//     rotation: 0,
//     color: tetrominoColors[index],
//   };
//   return tetromino;
// }

// //function generateRandomTetromino(): Tetromino {
// //  const randomIndex = Math.floor(Math.random() * tetrominoShapes.length);
// //  const randomShape = tetrominoShapes[randomIndex];
// //  const tetromino: Tetromino = {
// //    shape: randomShape,
// //    x: 0,
// //    y: 0,
// //    color: tetrominoColors[randomIndex],
// //  };
// //  return tetromino;
// //}

// function getShadow(tetromino: Tetromino, map: number[][]): Tetromino {
//   const tempPiece = structuredClone(tetromino) as Tetromino;
//   tempPiece.shape = tempPiece.shape.map((y) => y.map((n) => (n ? -2 : 0)));
//   let isCollided = false;
//   while (!isCollided) {
//     tempPiece.y++;
//     isCollided = checkCollision(map, tempPiece);
//   }
//   tempPiece.y--;

//   return tempPiece;
// }

// function checkCollision(board: number[][], tetromino: Tetromino): boolean {
//   for (let y = 0; y < tetromino.shape.length; y++) {
//     for (let x = 0; x < tetromino.shape[y].length; x++) {
//       // Check if the block in the Tetromino's shape is non-zero
//       if (tetromino.shape[y][x] !== 0) {
//         const boardX = tetromino.x + x;
//         const boardY = tetromino.y + y;

//         // Check if the block is outside the board boundaries
//         if (boardX < 0 || boardX >= board[0].length || boardY >= board.length) {
//           return true;
//         }

//         // Check if the block overlaps with a non-zero block on the board
//         if (boardY >= 0 && board[boardY][boardX] !== 0) {
//           return true;
//         }
//       }
//     }
//   }
//   return false;
// }

// function moveTetromino(
//   piece: Tetromino,
//   mode: "right" | "left" | "rotateCw" | "rotateCcw" | "drop" | "hardDrop",
//   map: number[][]
// ): [Tetromino, boolean | undefined, boolean | undefined] {
//   let toSolidate = false;
//   let isKicked = false;

//   switch (mode) {
//     case "right": {
//       const tempPiece = structuredClone(piece) as typeof piece;
//       tempPiece.x++;
//       tempPiece.y;

//       if (!checkCollision(map, tempPiece)) {
//         return [tempPiece, toSolidate, isKicked];
//       }
//       return [piece, toSolidate, isKicked];
//     }
//     case "left": {
//       const tempPiece = structuredClone(piece) as typeof piece;
//       tempPiece.x--;
//       tempPiece.y;

//       if (!checkCollision(map, tempPiece)) {
//         return [tempPiece, toSolidate, isKicked];
//       }
//       return [piece, toSolidate, isKicked];
//     }
//     case "drop": {
//       const tempPiece = structuredClone(piece) as typeof piece;
//       tempPiece.y++;

//       if (!checkCollision(map, tempPiece)) {
//         return [tempPiece, toSolidate, isKicked];
//       }
//       toSolidate = true;
//       return [piece, toSolidate, isKicked];
//     }
//     case "hardDrop": {
//       const tempPiece = structuredClone(piece) as typeof piece;
//       let isCollided = false;
//       while (!isCollided) {
//         tempPiece.y++;
//         isCollided = checkCollision(map, tempPiece);
//       }
//       tempPiece.y--;
//       toSolidate = true;
//       return [tempPiece, toSolidate, isKicked];
//     }
//     case "rotateCw": {
//       const tempPiece = structuredClone(piece) as typeof piece;
//       const size = tempPiece.shape.length;
//       const shape = tempPiece.shape;
//       const newShape = Array(size)
//         .fill(0)
//         .map(() => Array(size).fill(0));
//       for (let y = 0; y < size; y++) {
//         for (let x = 0; x < size; x++) {
//           newShape[x][y] = shape[size - 1 - y][x];
//         }
//       }
//       tempPiece.shape = newShape;
//       tempPiece.rotation = (tempPiece.rotation + 1) % 4;

//       // SRS check
//       const { cw } = getSrsByIndex(tempPiece.key);

//       let rotatedResult = piece;
//       if (!checkCollision(map, tempPiece)) {
//         // If normal rotion works, use it
//         return [tempPiece, toSolidate, isKicked];
//       } else {
//         // Test for all SRS
//         for (let srs of cw[piece.rotation]) {
//           const tempPiece2 = structuredClone(tempPiece) as typeof piece;
//           const [dx, dy] = srs;
//           tempPiece2.x += dx;
//           tempPiece2.y -= dy;
//           if (!checkCollision(map, tempPiece2)) {
//             // One of the SRS works, so use this.
//             isKicked = true;
//             rotatedResult = tempPiece2;
//             break;
//           }
//         }
//         return [rotatedResult, toSolidate, isKicked];
//       }
//     }
//     case "rotateCcw": {
//       const tempPiece = structuredClone(piece) as typeof piece;
//       const size = tempPiece.shape.length;
//       const shape = tempPiece.shape;
//       const newShape = Array(size)
//         .fill(0)
//         .map(() => Array(size).fill(0));
//       for (let y = 0; y < size; y++) {
//         for (let x = 0; x < size; x++) {
//           newShape[size - x - 1][y] = shape[y][x];
//         }
//       }
//       tempPiece.shape = newShape;
//       tempPiece.rotation =
//         tempPiece.rotation - 1 < 0 ? 3 : tempPiece.rotation - 1;

//       // SRS check
//       const { ccw } = getSrsByIndex(tempPiece.key);

//       let rotatedResult = piece;
//       if (!checkCollision(map, tempPiece)) {
//         // If normal rotion works, use it
//         return [tempPiece, toSolidate, isKicked];
//       } else {
//         // Test for all SRS
//         for (let srs of ccw[piece.rotation]) {
//           const tempPiece2 = structuredClone(tempPiece) as typeof piece;
//           const [dx, dy] = srs;
//           tempPiece2.x += dx;
//           tempPiece2.y -= dy;
//           if (!checkCollision(map, tempPiece2)) {
//             // One of the SRS works, so use this.
//             isKicked = true;
//             rotatedResult = tempPiece2;
//             break;
//           }
//         }
//         return [rotatedResult, toSolidate, isKicked];
//       }
//     }

//     default:
//       return [piece, toSolidate, isKicked];
//   }
// }

// function solidate(tetromino: Tetromino, map: number[][], isShadow?: boolean) {
//   const { x, y, shape } = tetromino;
//   const newMap = structuredClone(map) as number[][];

//   for (let j in shape) {
//     const s = newMap[j];
//     for (let i in s) {
//       const check = shape[j][i];
//       if (check) {
//         newMap[y + Number(j)][x + Number(i)] = isShadow ? -2 : check;
//       }
//     }
//   }

//   const removingIndex: number[] = [];
//   for (let j in newMap) {
//     let c = 0;
//     for (let i of newMap[j]) {
//       if (i !== 0) {
//         c++;
//       }
//       if (c === 10) {
//         removingIndex.push(Number(j));
//       }
//     }
//   }
//   for (let i of removingIndex) {
//     newMap.splice(i, 1);
//     newMap.unshift(Array(xCount).fill(0));
//   }

//   return newMap;
// }

// function makeNewMap() {
//   return Array.from(new Array(yCount), (_, i) => {
//     const r = i < 120 ? -1 : Math.floor(Math.random() * 10);
//     return Array.from(new Array(xCount), (_, j) =>
//       r < 0 ? 0 : j !== r ? -1 : 0
//     );
//   });
// }

function App() {
  return (
    <div className="w-screen min-h-screen overflow-x-hidden relative">
      <div className="fixed top-0 min-h-12 py-3 bg-white shadow w-full">
        <div className="container  px-12 mx-auto flex items-center justify-between">
          <div className="text-lg font-extrabold uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#E53935] to-[#FFA726]">
            Tetris React TS
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/room/1234"
              className="text-sm rounded px-4 py-2 hover:bg-blue-100 text-blue-600"
            >
              Invite
            </Link>
            <Link
              to="/play"
              className="text-sm rounded px-4 py-2 text-white bg-blue-500"
            >
              Play
            </Link>
          </div>
        </div>
      </div>
      <div className="container px-12 mx-auto pt-20">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
