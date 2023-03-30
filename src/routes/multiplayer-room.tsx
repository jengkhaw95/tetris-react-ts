import { useParams } from "react-router-dom"
import { useWS } from "../lib/ws";

export default function MultiplayerRoom() {

    const { sendToServer, amIReady, clientId, totalPlayer, readyPlayers, gameStartTimestamp } = useWS();
    return (
        <div>
            <div>Client ID: {clientId}</div>
            {gameStartTimestamp}
            <div>{readyPlayers.length} / {totalPlayer}</div>
            <button className={`rounded text-sm text-white px-4 py-2 disabled:bg-gray-200 ${amIReady ? 'bg-red-500' : 'bg-teal-500'}`} disabled={!!gameStartTimestamp} onClick={() => {
                if (gameStartTimestamp) {
                    return;
                }
                sendToServer({ type: "READY_STATE_CHANGE", isReady: !amIReady })
            }}>{gameStartTimestamp ? 'Game is starting...' : amIReady ? 'Cancel' : 'Ready'}</button>
        </div>
    )
}