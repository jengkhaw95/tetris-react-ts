import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { createContext } from 'react'

const globalContext = createContext<{ cellSize: number }>({ cellSize: 0 })

export const useGlobalContext = () => useContext(globalContext)

export function GlobalProvider({ children }: PropsWithChildren) {
  const [cellSize, setCellSize] = useState(0)

  useEffect(() => {
    const updateCellSize = () => {
      // Dimension -  window.innerHeight, window.innerWidth
      const cs = Math.min(24, Math.max(10, window.innerHeight / 40))
      setCellSize(cs)
    }

    updateCellSize()
    window.addEventListener('resize', updateCellSize)

    return () => {
      window.removeEventListener('resize', updateCellSize)
    }
  }, [])

  return (
    <globalContext.Provider value={{ cellSize }}>
      {children}
    </globalContext.Provider>
  )
}
