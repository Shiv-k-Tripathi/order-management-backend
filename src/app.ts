
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import orderRoutes from "./routes/order.routes";
import storeRoutes from "./routes/store.routes";
import productRoutes from "./routes/product.routes";
import analyticsRoutes from "./routes/analytics.routes";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// HTTP logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Order Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// API root
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Order Management API",
    version: "1.0.0",
  });
});

// Order APIs
app.use("/api/orders", orderRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;