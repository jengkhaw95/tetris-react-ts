import React, { useState } from 'react'
import Gameboard from '../components/gameboard'
import { useTetrisEngine } from '../lib/engine'

export default function Test() {
  const [isGameOver, setIsGameOver] = useState(false)
  const gameBoardData = useTetrisEngine({
    gameMode: 'test',
    isGameOver: isGameOver,
    onGameOver() {
      setIsGameOver(true)
    },
  })

  const { reRoll, clearMap } = gameBoardData

  return (
    <div>
      <div className="flex items-center gap-4 justify-center mb-4">
        <button
          className="px-4 py-2 rounded text-white bg-indigo-500 text-sm"
          onClick={(e) => {
            reRoll()
            e.currentTarget.blur()
          }}
        >
          Re-roll
        </button>
        <button
          className="px-4 py-2 rounded text-white bg-indigo-500 text-sm"
          onClick={(e) => {
            clearMap()
            e.currentTarget.blur()
          }}
        >
          Clear Map
        </button>
      </div>
      <Gameboard data={gameBoardData} />
    </div>
  )
}
