import { z } from "zod";

export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required"),
    description: z.string().trim().optional(),
    price: z.number().positive("Price must be positive"),
    image: z.string().trim().optional(),
    stock: z.number().int().min(0).default(0),
  })
  .strict();

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    price: z.number().positive().optional(),
    image: z.string().trim().optional(),
    stock: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
