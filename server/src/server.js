
import "dotenv/config";

import { createServer } from "http";

import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = createServer(app);

    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`MoveMate server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
