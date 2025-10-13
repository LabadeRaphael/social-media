"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initialize or reuse a single socket connection.
 * Cookies (HttpOnly) will be sent automatically via `withCredentials: true`.
 */
const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003", {
      withCredentials: true, // ✅ send cookies to backend for auth
      transports: ["websocket"], // use websocket directly
      reconnection: true, // auto reconnect
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Disconnected:", reason);
    });
  }

  return socket;
};
export { getSocket }
