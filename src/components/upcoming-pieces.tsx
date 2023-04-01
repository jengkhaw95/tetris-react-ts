import React from 'react'
import { PREVIEW_COUNT } from '../lib/config'
import Tetromino from './tetromino'

export default function UpcomingPieces({ seeds }: { seeds: number[] }) {
  return (
    <div className="flex flex-col gap-4 items-center">
      {seeds.slice(1, PREVIEW_COUNT + 1).map((s, i) => (
        <Tetromino key={i} index={s} />
      ))}
    </div>
  )
}
