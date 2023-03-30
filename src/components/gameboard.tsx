import React from "react";
import {
  cellSize,
  PREVIEW_COUNT,
  tetrominoColors,
  xCount,
  yCount,
} from "../lib/config";
import {TetrisEngineProps, useTetrisEngine} from "../lib/engine";
import Tetromino from "./tetromino";

interface GameBoardProps extends TetrisEngineProps {}

export default function Gameboard({
  isPaused,
  onGameOver,
  onSnapshot,
}: GameBoardProps) {
  const {map, tetromino, shadow, seeds, swap} = useTetrisEngine({
    isPaused,
    onGameOver,
    onSnapshot,
  });

  return (
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
  );
}
