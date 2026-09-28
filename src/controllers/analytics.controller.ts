import { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";

export const analyticsController = {
  async getDashboardAnalytics(_req: Request, res: Response) {
    try {
      const data = await analyticsService.getDashboardAnalytics();

      return res.status(200).json({
        success: true,
        message: "Analytics fetched successfully",
        data,
      });
    } catch (error) {
      console.error("Analytics error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch analytics",
      });
    }
  },
};