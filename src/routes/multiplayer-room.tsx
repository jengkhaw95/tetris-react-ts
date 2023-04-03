import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import FakeGameBoard from '../components/fake-gameboard'
import Gameboard from '../components/gameboard'
import IconCopy from '../components/icons/copy'
import IconUser from '../components/icons/user'
import {
  calculateGarbageLineCountByCombo,
  MAX_PLAYER_PER_ROOM,
  MIN_SNAPSHOT_INTERVAL,
} from '../lib/config'
import { EngineConnectorType, useTetrisEngine } from '../lib/engine'
import { useWS } from '../lib/ws'
import { GameSnapshot } from '../types'

export default function MultiplayerRoom() {
  const engineConnectorRef = useRef<EngineConnectorType>()
  const {
    sendToServer,
    amIReady,
    clientId,
    roomId,
    totalPlayer,
    readyPlayers,
    gameStartTimestamp,
    playerSnapshot,
    isGameOver,
    leftPlayers,
    losers,
  } = useWS({ engineConnector: engineConnectorRef })

  const timerRef = useRef<NodeJS.Timer>()
  const lastSnapshotTimstamp = useRef<number>(0)
  const [countDown, setCountDown] = useState<number>(0)

  const targetingPool = playerSnapshot.filter(
    (p) => !losers.includes(p.playerId) && p.playerId !== clientId
  )
  const targetingPlayerIndex = Math.abs(countDown) % targetingPool.length

  const handleSendSnapshotToServer = (snapshot: GameSnapshot) => {
    const n = Date.now()
    const interval = n - lastSnapshotTimstamp.current
    if (interval > MIN_SNAPSHOT_INTERVAL) {
      sendToServer({ type: 'GAME_SNAPSHOT', snapshot })
      lastSnapshotTimstamp.current = n
    } else {
      console.log(`Blocked snapshot sending: ${interval}ms`)
    }
  }

  const handleComboCount = (combo: number) => {
    const toSend = calculateGarbageLineCountByCombo(combo)
    if (targetingPool.length < 1) {
      return
    }
    const targetingPlayerId = targetingPool[targetingPlayerIndex]?.playerId
    if (!targetingPlayerId) {
      return
    }
    console.log(`Attacking ${combo}`)
    sendToServer({
      type: 'ATTACK',
      lineCount: toSend,
      target: targetingPlayerId,
    })
  }

  const gameBoardData = useTetrisEngine({
    gameMode: 'multi',
    engineConnector: engineConnectorRef,
    isPaused: !gameStartTimestamp || countDown > 0 || isGameOver,
    isGameOver: isGameOver,
    onGameOver: (timestamp) => sendToServer({ type: 'GAME_OVER', timestamp }),
    onSnapshot: handleSendSnapshotToServer,
    onLineClear: handleComboCount,
  })

  const copyUrl = `${window.location.protocol}//${window.location.host}/room/${roomId}`

  // Start counting down when all players are ready (gameStartTimestamp is set)
  useEffect(() => {
    if (isGameOver) {
      clearInterval(timerRef.current)
      setCountDown(0)
    } else if (gameStartTimestamp) {
      timerRef.current = setInterval(() => {
        const tts = gameStartTimestamp - Date.now()
        // Prevent stoping just to re-use count to target attacking player
        //if (tts < 0) {
        //  clearInterval(timerRef.current);
        //}
        setCountDown(Math.ceil(tts / 1000))
      }, 100)
    }

    return () => {
      clearInterval(timerRef.current)
    }
  }, [gameStartTimestamp])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center font-semibold text-slate-700 uppercase gap-12">
        <div>Client ID: {clientId}</div>
        <div>Room ID: {roomId}</div>
      </div>
      {!gameStartTimestamp && !!roomId ? (
        <button
          className="flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded bg-slate-100 w-max hover:text-white group hover:bg-gradient-to-r hover:from-[#E53935] hover:to-[#FFA726] hover:shadow"
          onClick={() => {
            navigator.clipboard.writeText(copyUrl)
            toast.success('Copied to clipboard')
          }}
        >
          <IconCopy
            size={16}
            className="text-slate-700 group-hover:text-white"
          />
          <div>Invite link</div>
        </button>
      ) : null}
      {gameStartTimestamp ? (
        <div className="space-y-6">
          <div className="grid gap-2 grid-cols-2">
            <Gameboard data={gameBoardData} timer={countDown} />
            <div className="flex items-center gap-6 justify-center">
              {playerSnapshot.map(({ snapshot, playerId }) => (
                <FakeGameBoard
                  timer={countDown}
                  key={playerId}
                  data={snapshot}
                  hasLeft={leftPlayers.includes(playerId)}
                  hasLost={losers.includes(playerId)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <WaitingZone
          gameStartTimestamp={gameStartTimestamp}
          onReadyStateChanged={sendToServer}
          readyPlayers={readyPlayers}
          totalPlayer={totalPlayer}
          amIReady={amIReady}
        />
      )}
    </div>
  )
}

interface WaitingZoneProps {
  totalPlayer: number
  readyPlayers: string[]
  amIReady?: boolean
  gameStartTimestamp?: number
  onReadyStateChanged: (data: {
    type: 'READY_STATE_CHANGE'
    isReady: boolean
  }) => void
}

function WaitingZone({
  totalPlayer,
  readyPlayers,
  amIReady,
  gameStartTimestamp,
  onReadyStateChanged,
}: WaitingZoneProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-center gap-3">
        {Array.from(new Array(MAX_PLAYER_PER_ROOM), (_, i) => (
          <IconUser
            key={i}
            className={`drop-shadow ${
              i < readyPlayers.length
                ? 'text-teal-500'
                : i < totalPlayer
                ? 'text-slate-500'
                : 'text-slate-300'
            }`}
            size={40}
          />
        ))}
      </div>

      <button
        className={`rounded text-sm text-white px-4 py-2 disabled:bg-gray-200 ${
          amIReady ? 'bg-red-500' : 'bg-teal-500'
        }`}
        disabled={!!gameStartTimestamp || totalPlayer <= 1}
        onClick={() => {
          if (gameStartTimestamp || totalPlayer <= 1) {
            return
          }
          onReadyStateChanged({
            type: 'READY_STATE_CHANGE',
            isReady: !amIReady,
          })
        }}
      >
        {gameStartTimestamp
          ? 'Game is starting...'
          : amIReady
          ? 'Cancel'
          : 'Ready'}
      </button>
    </div>
  )
}
