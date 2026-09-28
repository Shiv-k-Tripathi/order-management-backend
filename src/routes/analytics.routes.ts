import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";

const router = Router();

router.get("/", analyticsController.getDashboardAnalytics);

export default router;