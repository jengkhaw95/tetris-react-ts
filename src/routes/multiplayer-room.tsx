import { useParams } from "react-router-dom"
import { useWS } from "../lib/ws";

export default function MultiplayerRoom() {

    const { sendToServer, amIReady, clientId, totalPlayer, readyPlayers } = useWS();



    return <div>
        <div>Client ID: {clientId}</div>
        <div>{readyPlayers.length} / {totalPlayer}</div>
        <button className="rounded text-sm text-white bg-teal-500 px-4 py-2" onClick={() => {
            sendToServer({ type: "READY_STATE_CHANGE", isReady: !amIReady })
        }}>{amIReady ? 'Cancel' : 'Ready'}</button>
    </div>
}