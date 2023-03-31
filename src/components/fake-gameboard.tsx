import React from "react";
import {
  cellSize,
  fakeCellSize,
  PREVIEW_COUNT,
  tetrominoColors,
  xCount,
  yCount,
} from "../lib/config";
import {GameSnapshot} from "../types";
import IconDisconnect from "./icons/disconnect";
import IconSad from "./icons/sad";
import Tetromino from "./tetromino";

export interface FakeGameBoardProps {
  data: GameSnapshot | null;
  size?: number;
  gameMode?: "default" | "multi";
  hasLeft?: boolean;
  hasLost?: boolean;
}

export default function FakeGameBoard({
  data,
  size,
  gameMode,
  hasLeft,
  hasLost,
}: FakeGameBoardProps) {
  size = size || cellSize;
  gameMode = gameMode || "default";
  if (!data) {
    return (
      <div>
        <div
          className="grid grid-cols-10 border"
          style={{
            width: `${size * xCount}px`,
            height: `${size * yCount}px`,
          }}
        ></div>
      </div>
    );
  }
  const {map, tetromino, shadow, swap, pendingGarbageLineCount, seeds} = data;
  return (
    <div className="flex gap-4 justify-center mx-auto">
      <div
        className="flex items-center justify-center"
        style={{
          width: `${size * 4}px`,
          height: `${size * 4}px`,
        }}
      >
        {swap !== null ? <Tetromino index={swap} /> : null}
      </div>
      <div
        className="relative grid grid-cols-10 border gap-px"
        //style={{
        //  width: `${cellSize * xCount}px`,
        //  height: `${cellSize * yCount}px`,
        //}}
      >
        <>
          {gameMode === "multi" ? (
            <div className="absolute w-2 rounded-full h-full -left-4 border overflow-hidden flex items-end">
              <div
                className="relative w-full bg-blue-100 rounded bg-gradient-to-t from-[#FFA726] to-[#E53935] transition-all"
                style={{height: `${(pendingGarbageLineCount / yCount) * 100}%`}}
              ></div>
            </div>
          ) : null}
          {/*<GameboardOverlay />*/}
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
                        : n === -2
                        ? "#ccc"
                        : "",
                    opacity: isShadow && !isTetromino ? ".35" : "",
                    width: `${size}px`,
                    height: `${size}px`,
                  }}
                ></div>
              );
            })
          )}
        </>
      </div>
      <div className="flex flex-col gap-4 items-center">
        {seeds.slice(1, PREVIEW_COUNT + 1).map((s, i) => (
          <Tetromino key={i} index={s} size={size} />
        ))}
      </div>
    </div>
  );
}
