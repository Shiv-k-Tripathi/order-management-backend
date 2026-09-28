
import { Router } from "express";
import { storeController } from "../controllers/store.controller";

const router = Router();

router.get("/", storeController.getStores);
router.get("/:id", storeController.getStoreById);
router.post("/", storeController.createStore);

export default router;