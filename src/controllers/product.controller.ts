import { Request, Response } from "express";
import { ZodError } from "zod";

import { productService } from "../services/product.service";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator";

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
    if (error.message === "Product not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  console.error("Product API error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export const productController = {
  // POST /products
  async createProduct(req: Request, res: Response) {
    try {
      const input = createProductSchema.parse(req.body);

      const product = await productService.createProduct(input);

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // GET /products
  async getProducts(_req: Request, res: Response) {
    try {
      const products = await productService.getProducts();

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // GET /products/:id
  async getProductById(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const product = await productService.getProductById(id);

      return res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: product,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // PATCH /products/:id
  async updateProduct(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const input = updateProductSchema.parse(req.body);

      const product = await productService.updateProduct(id, input);

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // DELETE /products/:id
  async deleteProduct(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const result = await productService.deleteProduct(id);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return handleError(res, error);
    }
  },
};