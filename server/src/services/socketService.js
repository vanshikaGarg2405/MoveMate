
import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const connectSocket = (token) => {
  if (!token) {
    return null;
  }

  // Reuse an existing connection.
  if (socket?.connected) {
    return socket;
  }

  // Close any previous connection before reconnecting.
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Connected to MoveMate notification server:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from notification server:", reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
