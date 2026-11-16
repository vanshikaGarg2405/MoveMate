
import { Server } from "socket.io";
import socketAuthMiddleware from "../middleware/socketAuthMiddleware.js";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authenticate every incoming socket connection.
  io.use(socketAuthMiddleware);

  // Give every authenticated user a private room.
  io.on("connection", (socket) => {
    const userId = socket.user.userId;

    socket.join(`user:${userId}`);

    console.log(`User connected to Socket.IO: ${userId}`);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected from Socket.IO: ${userId}`);
    });
  });

  console.log("Socket.IO initialized successfully");

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
