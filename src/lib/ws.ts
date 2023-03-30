import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const WS_URL = "ws://localhost:3000"
export const useWS = () => {
    const navigate = useNavigate();
    const { roomId: roomIdParam } = useParams();
    const ws = useRef<WebSocket>();
    const [clientId, setClientId] = useState<string>("");
    const [roomId, setRoomId] = useState();
    const [totalPlayer, setTotalPlayer] = useState<number>(1);
    const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
    const [leftPlayers, setLeftPlayers] = useState<string[]>([]);

    const [gameStartTimestamp, setGameStartTimestamp] = useState<number>();

    const amIReady = readyPlayers.includes(clientId)

    const sendToServer = (payload: any) => {
        ws.current?.send(JSON.stringify({ ...payload, clientId, roomId }));
    }



    useEffect(() => {
        console.log("INITIALING WS")
        ws.current = new WebSocket(`${WS_URL}?room=${roomIdParam}`);
        ws.current.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            switch (msg.type) {
                case "REJECT": {
                    toast.error(`Failed to join room`);
                    navigate("/");
                    break;
                }
                case "INIT": {
                    toast(`You have joined the room`);
                    const { totalPlayer, readyPlayers } = msg;
                    setRoomId(msg.roomId)
                    setClientId(msg.clientId)
                    setTotalPlayer(totalPlayer);
                    setReadyPlayers(readyPlayers);
                    break;
                }
                case "GAME_START": {
                    toast("Starting game...");
                    const { startTimestamp } = msg;
                    setGameStartTimestamp(startTimestamp);
                    break;
                }
                case "READY_STATE_CHANGE": {
                    const { totalPlayer, readyPlayers, } = msg;
                    setTotalPlayer(totalPlayer);
                    setReadyPlayers(readyPlayers);
                    break;
                }
                case "PLAYER_JOIN": {
                    toast(`Player joined`);
                    const { totalPlayer, readyPlayers } = msg;
                    setTotalPlayer(totalPlayer);
                    setReadyPlayers(readyPlayers);
                    break;
                }
                case "PLAYER_LEFT": {
                    toast(`Player left`);
                    const { playerId } = msg;
                    setTotalPlayer(p => p - 1);
                    setLeftPlayers(playerId);
                    break;
                }
                default:
                    break;
            }
        }

        return () => {
            console.log("CLOSE")
            ws.current?.close();
        }
    }, [])

    return { clientId, roomId, amIReady, totalPlayer, readyPlayers, sendToServer, gameStartTimestamp }

}