import React from 'react'
import { cellSize, tetrominoColors, xCount, yCount } from '../lib/config'
import { GameSnapshot } from '../types'
import { GameboardOverlay } from './gameboard'
import GarbageGauge from './garbage-gauge'
import SwapPiece from './swap-piece'
import UpcomingPieces from './upcoming-pieces'

export interface FakeGameBoardProps {
  data: GameSnapshot | null
  size?: number
  gameMode?: 'default' | 'multi'
  hasLeft?: boolean
  hasLost?: boolean
  timer?: number
}

export default function FakeGameBoard({
  data,
  size,
  gameMode,
  timer,
}: FakeGameBoardProps) {
  size = size || cellSize
  gameMode = gameMode || 'default'
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
    )
  }
  const { map, tetromino, shadow, swap, pendingGarbageLineCount, seeds } = data
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
                  width: `${size}px`,
                  height: `${size}px`,
                }}
              ></div>
            )
          })
        )}
        {gameMode === 'multi' ? (
          <GarbageGauge lineCount={pendingGarbageLineCount || 0} />
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
