import express from "express";
import WebSocket from "ws";
import {uuid} from "../utils";
import {MAX_PLAYER_PER_ROOM} from "../src/lib/config";

const app = express();
const server = app.listen(3000, () => {
  console.log("Server started on port 3000");
});

const wss = new WebSocket.Server({server});

type ClientIdType = string;

type RoomIdType = string;

interface GameState {
  startTimestamp: null | number;
  players: Set<ClientIdType>;
  readyState: Set<ClientIdType>;
  losers: Array<ClientIdType>;
  winner?: ClientIdType;
  isGameOver: false;
}

const wsClients: Map<ClientIdType, WebSocket> = new Map();
const clientRoomMap: Map<ClientIdType, RoomIdType> = new Map();
const gameState: Map<RoomIdType, GameState> = new Map();

function broadcastToRoom(
  roomId: RoomIdType,
  msg: any,
  skippingClientIds?: string | string[]
) {
  const gs = gameState.get(roomId);
  if (!gs) {
    return;
  }
  const skip = skippingClientIds
    ? Array.isArray(skippingClientIds)
      ? skippingClientIds
      : [skippingClientIds]
    : [];
  const {players} = gs;
  for (let clientId of players) {
    if (skip.includes(clientId)) {
      continue;
    }
    const ws = wsClients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({...msg, clientId}));
    }
  }
}

function sendInitRoomState(roomId: string, clientId: string) {
  const ws = wsClients.get(clientId);
  if (!ws) {
    return;
  }
  const gs = gameState.get(roomId);
  if (!gs) {
    return;
  }
  ws.send(
    JSON.stringify({
      type: "INIT",
      roomId,
      clientId,
      totalPlayer: gameState.get(roomId)!.players.size,
      readyPlayers: [...gameState.get(roomId)!.readyState],
      startTimestamp: gs.startTimestamp,
      isGameOver: gs.isGameOver,
    })
  );
  // broadcastToRoom(roomId, { type: eventType, totalPlayer: gameState.get(roomId)!.players.size, readyPlayers: [...gameState.get(roomId)!.readyState], startTimestamp: gs.startTimestamp, isGameOver: gs.isGameOver })
}

function broadcastRoomState(
  roomId: RoomIdType,
  eventType: "READY_STATE_CHANGE" | "PLAYER_JOIN" | "GAME_END",
  skippingClientIds?: string | string[]
) {
  const gs = gameState.get(roomId);
  if (!gs) {
    return;
  }
  broadcastToRoom(
    roomId,
    {
      type: eventType,
      totalPlayer: gameState.get(roomId)!.players.size,
      readyPlayers: [...gameState.get(roomId)!.readyState],
      startTimestamp: gs.startTimestamp,
      isGameOver: gs.isGameOver,
      winner: gs.winner,
      losers: gs.losers,
    },
    skippingClientIds
  );
}

wss.on("connection", (ws, req) => {
  console.log("Client connected");
  if (!req.url) {
    ws.close();
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomId = url.searchParams.get("room");
  const clientId = uuid();

  if (!roomId) {
    ws.close();
    return;
  }
  console.log(`Client ${clientId} request to join room ${roomId}`);

  wsClients.set(clientId, ws);
  clientRoomMap.set(clientId, roomId);
  const gameRoom = gameState.get(roomId);
  if (!gameRoom) {
    gameState.set(roomId, {
      startTimestamp: null,
      players: new Set([clientId]),
      readyState: new Set([]),
      isGameOver: false,
      losers: [],
    });
  } else {
    if (gameRoom.startTimestamp) {
      console.log("Cannot join, the game has started");
      ws.send(JSON.stringify({type: "REJECT"}));
      ws.close();
      return;
    }

    if (gameRoom.players.size >= MAX_PLAYER_PER_ROOM) {
      ws.send(JSON.stringify({type: "REJECT"}));
      ws.close();
      return;
    }
    gameRoom.players.add(clientId);
  }

  sendInitRoomState(roomId, clientId);
  broadcastRoomState(roomId, "PLAYER_JOIN", clientId);

  ws.on("message", (message: string) => {
    const msg = JSON.parse(message);
    switch (msg.type) {
      case "READY_STATE_CHANGE": {
        const {clientId, roomId, isReady} = msg;
        // Check is client in the room
        if (clientRoomMap.get(clientId) !== roomId) {
          // Client is not in the room
          console.log("NOT ROOM ID");
          return;
        }

        // Logic
        // If game is staring, no ready state change.
        const gs = gameState.get(roomId);
        if (!gs) {
          // Game state not found
          console.log("NO ROOM");
          return;
        }
        const isGameHasStarted = gs.startTimestamp;
        if (isGameHasStarted) {
          // Game has started
          console.log("GAME STARTED");
          return;
        }
        // If readyState size === player size, set startingTimestamp
        if (isReady) {
          gs.readyState.add(clientId);
        } else {
          gs.readyState.delete(clientId);
        }
        // Broadcast ready state
        broadcastRoomState(roomId, "READY_STATE_CHANGE");

        if (gs.readyState.size === gs.players.size) {
          gs.startTimestamp = Date.now() + 6_000;
          // Game started
          broadcastToRoom(roomId, {
            roomId,
            type: "GAME_START",
            startTimestamp: gs.startTimestamp,
            playerIds: [...gs.players],
          });
        }

        break;
      }

      case "GAME_SNAPSHOT": {
        const {snapshot, clientId, roomId} = msg;

        broadcastToRoom(
          roomId,
          {type: "GAME_SNAPSHOT", snapshot, playerId: clientId},
          clientId
        );

        break;
      }

      case "GAME_OVER": {
        const {roomId, clientId, timestamp} = msg;

        const gs = gameState.get(roomId);
        if (!gs) {
          return;
        }
        gs.losers.push(clientId);
        if (gs.losers.length >= gs.players.size - 1) {
          gs.winner = clientId;
          broadcastRoomState(roomId, "GAME_END");
          [...gs.players].forEach((playerId) => {
            wsClients.get(playerId)?.close();
            clientRoomMap.delete(playerId);
          });
          gameState.delete(roomId);
          // Close room
          return;
        }
        broadcastRoomState(roomId, "READY_STATE_CHANGE");

        break;
      }

      default:
        break;
    }
    console.log(`Received message: ${message}`);

    // Broadcast message to all clients
    // wss.clients.forEach((client) => {
    //     if (client !== ws && client.readyState === WebSocket.OPEN) {
    //         client.send(message);
    //     }
    // });
  });

  ws.on("open", (message: string) => {
    console.log("open", message);
  });

  ws.on("close", () => {
    // If is room, notify other players

    wsClients.delete(clientId);
    const clientRoom = clientRoomMap.get(clientId);
    if (clientRoom) {
      const gameRoom = gameState.get(clientRoom);
      if (gameRoom) {
        broadcastToRoom(clientRoom, {type: "PLAYER_LEFT", playerId: clientId});
        gameRoom.players.delete(clientId);
        gameRoom.readyState.clear();
        broadcastRoomState(clientRoom, "READY_STATE_CHANGE");
      }
    }
    clientRoomMap.delete(clientId);
    console.log("Client disconnected");
  });
});
