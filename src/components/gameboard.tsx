import React, { PropsWithChildren } from 'react'
import { cellSize, tetrominoColors } from '../lib/config'
import { useTetrisEngine } from '../lib/engine'
import GarbageGauge from './garbage-gauge'
import SwapPiece from './swap-piece'
import UpcomingPieces from './upcoming-pieces'

interface GameBoardProps {
  data: ReturnType<typeof useTetrisEngine>
  timer?: number
}

export default function Gameboard({ data, timer }: GameBoardProps) {
  const {
    gameMode,
    map,
    tetromino,
    shadow,
    seeds,
    swap,
    combo,
    garbageLineCount,
  } = data

  return (
    <div className="flex gap-4 justify-center mx-auto">
      <SwapPiece index={swap} />
      <div className="relative grid grid-cols-10 border gap-px">
        {map.map((m, y) =>
          m.map((n, x) => {
            const isTetrominoInRange =
              y - tetromino.y >= 0 &&
              y - tetromino.y < tetromino.shape.length &&
              x - tetromino.x >= 0 &&
              x - tetromino.x < tetromino.shape[0].length
            const isShadowInRange =
              y - shadow.y >= 0 &&
              y - shadow.y < shadow.shape.length &&
              x - shadow.x >= 0 &&
              x - shadow.x < shadow.shape[0].length
            const isTetromino =
              isTetrominoInRange &&
              tetromino.shape[y - tetromino.y][x - tetromino.x] > 0
            const isShadow =
              isShadowInRange && shadow.shape[y - shadow.y][x - shadow.x] === -2
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
                      ? '#ccc'
                      : '',
                  opacity: isShadow && !isTetromino ? '.35' : '',
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                }}
              ></div>
            )
          })
        )}
        {gameMode === 'multi' ? (
          <GarbageGauge lineCount={garbageLineCount.current || 0} />
        ) : null}
        <GameboardOverlay>
          {timer && timer > 0 ? (
            <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E53935] to-[#FFA726]">
              {timer}
            </div>
          ) : null}
        </GameboardOverlay>
      </div>
      <UpcomingPieces seeds={seeds} />
    </div>
  )
}

interface GameboardOverlayProps extends PropsWithChildren {}

export function GameboardOverlay({ children }: GameboardOverlayProps) {
  return (
    <div className="absolute z-10 w-full h-full flex items-center justify-center">
      {children}
    </div>
  )
}
