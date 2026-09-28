import { Server, Socket } from "socket.io";

let io: Server | null = null;

const STORE_ID_REGEX = /^[a-fA-F0-9]{24}$/;

export const storeRoom = (storeId: string): string => {
  return `store:${storeId}`;
};

export const initializeOrderSocket = (socketServer: Server): void => {
  io = socketServer;

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join a store room
    socket.on("store:join", async (storeId: unknown) => {
      if (
        typeof storeId !== "string" ||
        !STORE_ID_REGEX.test(storeId)
      ) {
        socket.emit("socket:error", {
          message: "A valid store ID is required",
        });

        return;
      }

      try {
        const room = storeRoom(storeId);

        await socket.join(room);

        console.log(
          `📦 Socket ${socket.id} joined store room: ${room}`
        );

        socket.emit("store:joined", {
          storeId,
          room,
          message: "Successfully subscribed to store updates",
        });
      } catch (error) {
        console.error("❌ Failed to join store room:", error);

        socket.emit("socket:error", {
          message: "Unable to subscribe to store updates",
        });
      }
    });

    // Leave a store room
    socket.on("store:leave", async (storeId: unknown) => {
      if (
        typeof storeId !== "string" ||
        !STORE_ID_REGEX.test(storeId)
      ) {
        socket.emit("socket:error", {
          message: "A valid store ID is required",
        });

        return;
      }

      try {
        const room = storeRoom(storeId);

        await socket.leave(room);

        console.log(
          `📤 Socket ${socket.id} left store room: ${room}`
        );

        socket.emit("store:left", {
          storeId,
          room,
        });
      } catch (error) {
        console.error("❌ Failed to leave store room:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `🔌 Socket disconnected: ${socket.id} (${reason})`
      );
    });
  });
};

// ----------------------------------------
// ORDER CREATED
// ----------------------------------------

export const emitOrderCreated = (
  order: {
    id: string;
    storeId: string;
    [key: string]: unknown;
  }
): void => {
  if (!io) {
    console.warn("⚠️ Socket.IO is not initialized");

    return;
  }

  const room = storeRoom(order.storeId);

  console.log("📡 Emitting order:created");
  console.log("📦 Room:", room);
  console.log("📦 Order:", order);

  io.to(room).emit("order:created", order);
};

// ----------------------------------------
// ORDER STATUS UPDATED
// ----------------------------------------

export const emitOrderStatusUpdated = (
  order: {
    id: string;
    storeId: string;
    [key: string]: unknown;
  }
): void => {
  if (!io) {
    console.warn("⚠️ Socket.IO is not initialized");

    return;
  }

  const room = storeRoom(order.storeId);

  console.log("📡 Emitting order:statusUpdated");
  console.log("📦 Room:", room);
  console.log("📦 Order:", order);

  io.to(room).emit("order:statusUpdated", order);
};