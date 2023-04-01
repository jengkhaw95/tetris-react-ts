import React from 'react'
import { yCount } from '../lib/config'

export default function GarbageGauge({ lineCount }: { lineCount: number }) {
  return (
    <div className="absolute w-2 rounded-full h-full -left-4 border overflow-hidden flex items-end">
      <div
        className="relative w-full bg-blue-100 rounded bg-gradient-to-t from-[#FFA726] to-[#E53935] transition-all"
        style={{
          height: `${(lineCount / yCount) * 100}%`,
        }}
      ></div>
    </div>
  )
}
