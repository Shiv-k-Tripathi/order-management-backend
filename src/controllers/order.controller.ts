
import { Request, Response } from "express";
import { ZodError } from "zod";
import { orderService } from "../services/order.service";
import {
  createOrderSchema,
  getOrdersQuerySchema,
  updateOrderStatusSchema,
} from "../validators/order.validator";

const handleError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error instanceof Error) {
  if (
    error.message === "Store not found" ||
    error.message === "Order not found" ||
    error.message.includes("Product") ||
    error.message.includes("products")
  ) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  if (
    error.message === "Store is inactive" ||
    error.message === "Total amount does not match product prices" ||
    error.message.includes("Insufficient stock")
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

  console.error("Order API error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export const orderController = {
  // POST /orders
  async createOrder(req: Request, res: Response) {
    try {
      const input = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(input);

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // GET /orders?store_id=&page=&limit=
  async getOrders(req: Request, res: Response) {
    try {
      const query = getOrdersQuerySchema.parse(req.query);
      const result = await orderService.getOrders(query);

      return res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        ...result,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // PATCH /orders/:id/status
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      const input = updateOrderStatusSchema.parse(req.body);
      const order = await orderService.updateOrderStatus(id, input);

      return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },
};