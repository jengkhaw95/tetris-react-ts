import React from "react";
import {fakeCellSize, tetrominoColors, xCount, yCount} from "../lib/config";
import {GameSnapshot, Tetromino} from "../types";
import IconDisconnect from "./icons/disconnect";
import IconSad from "./icons/sad";

export interface FakeGameBoardProps {
  data: GameSnapshot | null;
  hasLeft?: boolean;
  hasLost?: boolean;
}

export default function FakeGameBoard({
  data,
  hasLeft,
  hasLost,
}: FakeGameBoardProps) {
  if (!data) {
    return (
      <div>
        <div
          className="grid grid-cols-10 border"
          style={{
            width: `${fakeCellSize * xCount}px`,
            height: `${fakeCellSize * yCount}px`,
          }}
        ></div>
      </div>
    );
  }
  const {map, tetromino, shadow} = data;
  return (
    <div className="relative">
      {hasLeft || hasLost ? (
        <div className="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {hasLeft ? (
            <IconDisconnect className="text-slate-700" size={32} />
          ) : hasLost ? (
            <IconSad className="text-slate-700" size={32} />
          ) : null}
        </div>
      ) : null}
      <div
        className={`grid grid-cols-10 border ${
          hasLeft || hasLost ? "bg-slate-100 blur-[2px] opacity-80" : ""
        }`}
        style={{
          width: `${fakeCellSize * xCount}px`,
          height: `${fakeCellSize * yCount}px`,
        }}
      >
        {data.map.map((m, y) =>
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
                  width: `${fakeCellSize}px`,
                  height: `${fakeCellSize}px`,
                }}
              ></div>
            );
          })
        )}
      </div>
    </div>
  );
}
