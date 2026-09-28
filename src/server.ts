import "dotenv/config";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

import app from "./app";
import { prisma } from "./config/prisma";
import { env } from "./config/env";
import { initializeOrderSocket } from "./sockets/order.socket";

const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

initializeOrderSocket(io);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("MongoDB connected successfully");

    httpServer.listen(env.PORT, () => {
      console.log(`Server running at http://localhost:${env.PORT}`);
      console.log("Socket.IO initialized");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

async function shutdown() {
  console.log("Shutting down server...");

  httpServer.close(async () => {
    await prisma.$disconnect();
    console.log("Database disconnected");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();