import { useState } from 'react'
import Gameboard from '../components/gameboard'
import { useTetrisEngine } from '../lib/engine'

export default function Play() {
  const [isGameOver, setIsGameOver] = useState(false)
  const gameBoardData = useTetrisEngine({
    isGameOver: isGameOver,
    onGameOver() {
      setIsGameOver(true)
    },
  })
  return (
    <div>
      <Gameboard data={gameBoardData} />
    </div>
  )
}
