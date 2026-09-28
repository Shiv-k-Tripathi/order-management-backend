
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB ObjectId");

export const createOrderSchema = z
  .object({
    storeId: objectIdSchema,
    items: z
      .array(
        z.object({
          itemId: z.string().trim().min(1, "Item ID is required"),
          qty: z.number().int().positive("Quantity must be positive"),
        }).strict()
      )
      .min(1, "At least one item is required"),
    totalAmount: z.number().positive("Total amount must be positive"),
  })
  .strict();

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(["PLACED", "PREPARING", "COMPLETED"]),
  })
  .strict();

export const getOrdersQuerySchema = z.object({
  store_id: objectIdSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;