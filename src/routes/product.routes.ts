import { Router } from "express";
import { productController } from "../controllers/product.controller";

const router = Router();

// Create product
router.post("/", productController.createProduct);

// Get all products
router.get("/", productController.getProducts);

// Get product by ID
router.get("/:id", productController.getProductById);

// Update product
router.patch("/:id", productController.updateProduct);

// Delete product
router.delete("/:id", productController.deleteProduct);

export default router;