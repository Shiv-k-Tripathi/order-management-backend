import { prisma } from "../config/prisma";
import {
  emitOrderCreated,
  emitOrderStatusUpdated,
} from "../sockets/order.socket";
import type {
  CreateOrderInput,
  GetOrdersQuery,
  UpdateOrderStatusInput,
} from "../validators/order.validator";

export const orderService = {
  // Create a new order and notify the relevant store
  async createOrder(input: CreateOrderInput) {
    // 1. Verify store exists
    const store = await prisma.store.findUnique({
      where: {
        id: input.storeId,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!store) {
      throw new Error("Store not found");
    }

    if (!store.isActive) {
      throw new Error("Store is inactive");
    }

    // 2. Get requested products
    const itemIds = input.items.map((item) => item.itemId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: itemIds,
        },
        isActive: true,
      },
      select: {
        id: true,
        price: true,
        stock: true,
      },
    });

    // 3. Make sure every requested product exists
    const uniqueItemIds = new Set(itemIds);

    if (products.length !== uniqueItemIds.size) {
      throw new Error("One or more products not found or inactive");
    }

    // 4. Calculate total
    let calculatedTotal = 0;

    for (const item of input.items) {
      const product = products.find(
        (product) => product.id === item.itemId
      );

      if (!product) {
        throw new Error(`Product ${item.itemId} not found`);
      }

      if (product.stock < item.qty) {
        throw new Error(
          `Insufficient stock for product ${item.itemId}`
        );
      }

      calculatedTotal += product.price * item.qty;
    }

    // 5. Verify total amount
    if (Math.abs(calculatedTotal - input.totalAmount) > 0.01) {
      throw new Error(
        "Total amount does not match product prices"
      );
    }

    // 6. Create order
    const order = await prisma.order.create({
      data: {
        storeId: input.storeId,
        items: input.items,
        totalAmount: calculatedTotal,
        status: "PLACED",
      },
    });

    // 7. Notify connected clients
    emitOrderCreated({ ...order });

    return order;
  },

  // Retrieve paginated orders, optionally filtered by store
  async getOrders(query: GetOrdersQuery) {
    const { store_id, page, limit } = query;

    const skip = (page - 1) * limit;

    const where = store_id
      ? {
          storeId: store_id,
        }
      : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.order.count({
        where,
      }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  },

  // Update order status
  async updateOrderStatus(
    id: string,
    input: UpdateOrderStatusInput
  ) {
    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: input.status,
      },
    });

    // Notify only after successful database update
    emitOrderStatusUpdated({
      ...updatedOrder,
    });

    return updatedOrder;
  },
};
