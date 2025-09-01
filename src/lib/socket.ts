// src/lib/socket.ts
import { io, type Socket } from "socket.io-client";

let socket: Socket;

export const connectSocket = () => {
  socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1", {
    auth: { token: localStorage.getItem("accessToken") },
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;
