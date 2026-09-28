
import { Router } from "express";
import { orderController } from "../controllers/order.controller";

const router = Router();

// Create a new order
router.post("/", orderController.createOrder);

// Get orders with optional store filtering and pagination
router.get("/", orderController.getOrders);

// Update order status
router.patch("/:id/status", orderController.updateOrderStatus);

export default router;