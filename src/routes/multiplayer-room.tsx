import {useEffect, useRef, useState} from "react";
import FakeGameBoard from "../components/fake-gameboard";
import Gameboard from "../components/gameboard";
import IconUser from "../components/icons/user";
import {
  comboCount,
  MAX_PLAYER_PER_ROOM,
  MIN_SNAPSHOT_INTERVAL,
} from "../lib/config";
import {EngineConnectorType, useTetrisEngine} from "../lib/engine";
import {useWS} from "../lib/ws";
import {GameSnapshot} from "../types";

export default function MultiplayerRoom() {
  const engineConnectorRef = useRef<EngineConnectorType>();
  const {
    sendToServer,
    amIReady,
    clientId,
    totalPlayer,
    readyPlayers,
    gameStartTimestamp,
    playerSnapshot,
    isGameOver,
    leftPlayers,
    losers,
  } = useWS({engineConnector: engineConnectorRef});

  const timerRef = useRef<NodeJS.Timer>();
  const lastSnapshotTimstamp = useRef<number>(0);
  const [countDown, setCountDown] = useState<number>(0);

  const targetingPool = playerSnapshot.filter(
    (p) => !losers.includes(p.playerId) && p.playerId !== clientId
  );
  const targetingPlayerIndex = Math.abs(countDown) % targetingPool.length;

  const handleSendSnapshot = (snapshot: GameSnapshot) => {
    const n = Date.now();
    const interval = n - lastSnapshotTimstamp.current;
    if (interval > MIN_SNAPSHOT_INTERVAL) {
      sendToServer({type: "GAME_SNAPSHOT", snapshot});
      lastSnapshotTimstamp.current = n;
    } else {
      console.log(`Blocked snapshot sending: ${interval}ms`);
    }
  };

  const handleComboCount = (
    timestamp: number,
    lineClear: number,
    combo: number
  ) => {
    const toSend = comboCount(combo);
    console.log(targetingPool);
    if (targetingPool.length < 1) {
      return;
    }
    const targetingPlayerId = targetingPool[targetingPlayerIndex]?.playerId;
    if (!targetingPlayerId) {
      console.log(targetingPlayerIndex, targetingPool);
      return;
    }
    console.log(`Attacking ${combo}`);
    sendToServer({
      type: "ATTACK",
      lineCount: toSend + 1,
      target: targetingPlayerId,
    });
  };

  const gameBoardData = useTetrisEngine({
    engineConnector: engineConnectorRef,
    isPaused: countDown > 0 || isGameOver,
    isGameOver: isGameOver,
    onGameOver: (timestamp) => sendToServer({type: "GAME_OVER", timestamp}),
    onSnapshot: handleSendSnapshot,
    onLineClear: handleComboCount,
  });

  useEffect(() => {
    if (isGameOver) {
      clearInterval(timerRef.current);
      setCountDown(0);
    } else if (gameStartTimestamp) {
      timerRef.current = setInterval(() => {
        const tts = gameStartTimestamp - Date.now();
        // Prevent stoping just to re-use count to target attacking player
        //if (tts < 0) {
        //  clearInterval(timerRef.current);
        //}
        setCountDown(Math.ceil(tts / 1000));
      }, 100);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [gameStartTimestamp]);

  useEffect(() => {
    if (isGameOver) {
      // Show game over dialog
    }
  }, [isGameOver]);

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="font-semibold text-slate-700 uppercase">
        Client ID: {clientId}
      </div>
      {isGameOver ? "GAME OVER" : ""}
      {gameStartTimestamp ? (
        <div className="space-y-6">
          {countDown > 0 ? <div>Countdown: {countDown}</div> : null}
          <Gameboard data={gameBoardData} />
          <div className="flex items-center gap-6 justify-center">
            {playerSnapshot.map(({snapshot, playerId}) => (
              <FakeGameBoard
                key={playerId}
                data={snapshot}
                hasLeft={leftPlayers.includes(playerId)}
                hasLost={losers.includes(playerId)}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-3">
            {Array.from(new Array(MAX_PLAYER_PER_ROOM), (_, i) => (
              <IconUser
                key={i}
                className={` ${
                  i < readyPlayers.length
                    ? "text-teal-500"
                    : i < totalPlayer
                    ? "text-slate-500"
                    : "text-slate-300"
                }`}
                size={40}
              />
            ))}
          </div>

          <button
            className={`rounded text-sm text-white px-4 py-2 disabled:bg-gray-200 ${
              amIReady ? "bg-red-500" : "bg-teal-500"
            }`}
            disabled={!!gameStartTimestamp || totalPlayer <= 1}
            onClick={() => {
              if (gameStartTimestamp || totalPlayer <= 1) {
                return;
              }
              sendToServer({type: "READY_STATE_CHANGE", isReady: !amIReady});
            }}
          >
            {gameStartTimestamp
              ? "Game is starting..."
              : amIReady
              ? "Cancel"
              : "Ready"}
          </button>
        </>
      )}
    </div>
  );
}
