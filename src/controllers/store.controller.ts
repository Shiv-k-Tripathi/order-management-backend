
import type { Request, Response, NextFunction } from "express";
import { storeService } from "../services/store.service";
import {
  createStoreSchema,
  storeIdSchema,
} from "../validators/store.validator";

export const storeController = {
  // GET /api/stores
  async getStores(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const stores = await storeService.getStores();
      console.log('stores ::::',stores)

      res.status(200).json({
        success: true,
        data: stores,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/stores/:id
  async getStoreById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = storeIdSchema.parse(req.params);
      const store = await storeService.getStoreById(id);

      if (!store) {
        res.status(404).json({
          success: false,
          message: "Store not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: store,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/stores
  async createStore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const input = createStoreSchema.parse(req.body);
      const store = await storeService.createStore(input);

      res.status(201).json({
        success: true,
        message: "Store created successfully",
        data: store,
      });
    } catch (error) {
      next(error);
    }
  },
};