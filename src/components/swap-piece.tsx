import React from 'react'

import Tetromino from './tetromino'

export default function SwapPiece({ index }: { index: number | null }) {
  return (
    <div className="flex flex-col gap-4 items-center">
      {index !== null ? <Tetromino index={index} /> : null}
    </div>
  )
}
