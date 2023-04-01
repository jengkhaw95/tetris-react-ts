import React from 'react'

import Tetromino from './tetromino'

export default function SwapPiece({ index }: { index: number | null }) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <Tetromino index={index} />
    </div>
  )
}
