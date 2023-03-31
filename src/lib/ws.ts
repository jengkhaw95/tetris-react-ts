import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "react-hot-toast";
import {GameSnapshot} from "../types";

const WS_URL = "ws://localhost:3000";

export const useWS = () => {
  const navigate = useNavigate();
  const {roomId: roomIdParam} = useParams();
  const ws = useRef<WebSocket>();
  const [clientId, setClientId] = useState<string>("");
  const [roomId, setRoomId] = useState();
  const [totalPlayer, setTotalPlayer] = useState<number>(1);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [leftPlayers, setLeftPlayers] = useState<string[]>([]);
  const [losers, setLosers] = useState<string[]>([]);
  const [playerSnapshot, setPlayerSnapshot] = useState<
    {playerId: string; snapshot: GameSnapshot | null}[]
  >([]);

  const [winner, setWinner] = useState<string>("");
  const [gameStartTimestamp, setGameStartTimestamp] = useState<number>();

  const isGameOver = !!winner;
  const amIReady = readyPlayers.includes(clientId);

  const sendToServer = (payload: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current?.send(JSON.stringify({...payload, clientId, roomId}));
    }
  };

  useEffect(() => {
    console.log("Initializing Websocket");
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
          const {totalPlayer, readyPlayers} = msg;
          setRoomId(msg.roomId);
          setClientId(msg.clientId);
          setTotalPlayer(totalPlayer);
          setReadyPlayers(readyPlayers);
          break;
        }
        case "GAME_START": {
          toast("Starting game...");
          const {startTimestamp} = msg;
          setGameStartTimestamp(startTimestamp);
          break;
        }
        case "GAME_END": {
          const {winner} = msg;
          setWinner(winner);
          if (winner === clientId) {
            toast("You won!");
          } else {
            toast("Game Over");
          }
          ws.current?.close();
          break;
        }
        case "READY_STATE_CHANGE": {
          const {totalPlayer, readyPlayers, losers} = msg;
          setTotalPlayer(totalPlayer);
          setReadyPlayers(readyPlayers);
          setLosers(losers);
          break;
        }
        case "PLAYER_JOIN": {
          toast(`Player joined`);
          const {totalPlayer, readyPlayers} = msg;
          setTotalPlayer(totalPlayer);
          setReadyPlayers(readyPlayers);
          break;
        }
        case "PLAYER_LEFT": {
          toast(`Player left`);
          const {playerId} = msg;
          setTotalPlayer((p) => p - 1);
          setLeftPlayers(playerId);
          break;
        }
        case "GAME_SNAPSHOT": {
          const {snapshot, playerId} = msg;
          setPlayerSnapshot((s) =>
            s.map((n) => (n.playerId === playerId ? {...n, snapshot} : n))
          );

          break;
        }
        default:
          break;
      }
    };

    ws.current.onclose = () => {
      //if (!clientId) {
      //  toast.error("Failed to join");
      //  navigate("/");
      //}
    };

    return () => {
      console.log("Connection Closed");
      //toast.error("Disconnected");
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gameStartTimestamp) {
      setPlayerSnapshot(
        readyPlayers
          .filter((p) => p !== clientId)
          .map((p) => ({playerId: p, snapshot: null}))
      );
    }
  }, [gameStartTimestamp]);

  return {
    clientId,
    roomId,
    amIReady,
    totalPlayer,
    readyPlayers,
    sendToServer,
    playerSnapshot,
    isGameOver,
    leftPlayers,
    losers,
    gameStartTimestamp,
  };
};
