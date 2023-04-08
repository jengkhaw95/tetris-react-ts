import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { createContext } from 'react'

const DEFAULT_CONTEXT = { cellSize: 0, isKeyboardAvailable: true }

const globalContext = createContext<{
  cellSize: number
  isKeyboardAvailable: boolean
}>(DEFAULT_CONTEXT)

export const useGlobalContext = () => useContext(globalContext)

export function GlobalProvider({ children }: PropsWithChildren) {
  const [cellSize, setCellSize] = useState(DEFAULT_CONTEXT['cellSize'])
  const [isKeyboardAvailable, setIsKeyboardAvailable] = useState(
    DEFAULT_CONTEXT['isKeyboardAvailable']
  )

  useEffect(() => {
    const handleTouchStart = () => {
      setIsKeyboardAvailable(false)
    }

    const updateCellSize = () => {
      // Dimension -  window.innerHeight, window.innerWidth
      const cs = Math.min(24, Math.max(10, window.innerHeight / 40))
      setCellSize(cs)
    }

    updateCellSize()
    window.addEventListener('resize', updateCellSize)
    window.addEventListener('touchstart', handleTouchStart)

    return () => {
      window.removeEventListener('resize', updateCellSize)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  return (
    <globalContext.Provider value={{ cellSize, isKeyboardAvailable }}>
      {children}
    </globalContext.Provider>
  )
}
