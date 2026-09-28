import { prisma } from "../config/prisma";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../validators/product.validator";

export const productService = {
  // Create product
  async createProduct(input: CreateProductInput) {
    return prisma.product.create({
      data: input,
    });
  },

  // Get all products
  async getProducts() {
    return prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // Get product by ID
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  },

  // Update product
  async updateProduct(id: string, input: UpdateProductInput) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    return prisma.product.update({
      where: { id },
      data: input,
    });
  },

  // Delete product
  async deleteProduct(id: string) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    await prisma.product.delete({
      where: { id },
    });

    return {
      message: "Product deleted successfully",
    };
  },
};
