
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

export const createStoreSchema = z.object({
  name: z.string().trim().min(2, "Store name is required").max(150),
});

export const storeIdSchema = z.object({
  id: objectIdSchema,
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;