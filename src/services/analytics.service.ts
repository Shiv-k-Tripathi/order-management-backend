import { prisma } from "../config/prisma";

export const analyticsService = {
  async getDashboardAnalytics() {
    const [ordersPerDay, revenuePerStore, topSellingItems] =
      await Promise.all([
        // 1. Orders per day
        prisma.order.aggregateRaw({
          pipeline: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$created_at",
                  },
                },
                orders: { $sum: 1 },
                revenue: { $sum: "$total_amount" },
              },
            },
            {
              $sort: { _id: 1 },
            },
            {
              $project: {
                _id: 0,
                date: "$_id",
                orders: 1,
                revenue: 1,
              },
            },
          ],
        }),

        // 2. Total revenue per store
        prisma.order.aggregateRaw({
          pipeline: [
            {
              $group: {
                _id: "$store_id",
                orders: { $sum: 1 },
                revenue: { $sum: "$total_amount" },
              },
            },
            {
              $lookup: {
                from: "stores",
                localField: "_id",
                foreignField: "_id",
                as: "store",
              },
            },
            {
              $unwind: {
                path: "$store",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                storeId: { $toString: "$_id" },
                storeName: { $ifNull: ["$store.name", "Unknown Store"] },
                orders: 1,
                revenue: 1,
              },
            },
            {
              $sort: { revenue: -1 },
            },
          ],
        }),

        // 3. Top 5 selling products
        prisma.order.aggregateRaw({
          pipeline: [
            {
              $unwind: "$items",
            },
            {
              $group: {
                _id: "$items.item_id",
                quantitySold: { $sum: "$items.qty" },
              },
            },
            {
              $addFields: {
                productObjectId: {
                  $convert: {
                    input: "$_id",
                    to: "objectId",
                    onError: null,
                    onNull: null,
                  },
                },
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "productObjectId",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                itemId: { $toString: "$_id" },
                name: { $ifNull: ["$product.name", "Unknown Product"] },
                quantitySold: 1,
                revenue: {
                  $multiply: [
                    "$quantitySold",
                    { $ifNull: ["$product.price", 0] },
                  ],
                },
              },
            },
            {
              $sort: { quantitySold: -1 },
            },
            {
              $limit: 5,
            },
          ],
        }),
      ]);

    return {
      ordersPerDay,
      revenuePerStore,
      topSellingItems,
    };
  },
};