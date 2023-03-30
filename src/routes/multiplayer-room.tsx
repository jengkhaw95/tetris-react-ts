import {useEffect, useRef, useState} from "react";
import FakeGameBoard from "../components/fake-gameboard";
import Gameboard from "../components/gameboard";
import IconUser from "../components/icons/user";
import {MAX_PLAYER_PER_ROOM, MIN_SNAPSHOT_INTERVAL} from "../lib/config";
import {useWS} from "../lib/ws";
import {GameSnapshot} from "../types";

export default function MultiplayerRoom() {
  const {
    sendToServer,
    amIReady,
    clientId,
    totalPlayer,
    readyPlayers,
    gameStartTimestamp,
    playerSnapshot,
    isGameOver,
  } = useWS();

  const timerRef = useRef<NodeJS.Timer>();
  const lastSnapshotTimstamp = useRef<number>(0);
  const [countDown, setCountDown] = useState<number>(0);

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

  useEffect(() => {
    if (gameStartTimestamp) {
      timerRef.current = setInterval(() => {
        const tts = gameStartTimestamp - Date.now();
        if (tts < 0) {
          clearInterval(timerRef.current);
        }
        setCountDown(Math.ceil(tts / 1000));
      }, 100);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [gameStartTimestamp]);

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="font-semibold text-slate-700 uppercase">
        Client ID: {clientId}
      </div>
      {gameStartTimestamp ? (
        <div className="space-y-6">
          {countDown > 0 ? <div>Countdown: {countDown}</div> : null}
          <Gameboard
            isPaused={countDown > 0 || isGameOver}
            onGameOver={(timestamp) =>
              sendToServer({type: "GAME_OVER", timestamp})
            }
            onSnapshot={handleSendSnapshot}
          />
          <div className="flex items-center gap-6 justify-center">
            {playerSnapshot.map(({snapshot, playerId}) => (
              <FakeGameBoard key={playerId} data={snapshot} />
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
