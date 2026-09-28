
import { prisma } from "../config/prisma";
import type { CreateStoreInput } from "../validators/store.validator";

export const storeService = {
    // Get all active stores
    async getStores() {
        return prisma.store.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        });
    },

    // Get store by ID with active products
    async getStoreById(id: string) {
        const store = await prisma.store.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
            },
        });

        if (!store) {
            throw new Error("Store not found");
        }

        return store;
    },

    // Create a new store
    async createStore(input: CreateStoreInput) {
        return prisma.store.create({
            data: {
                name: input.name,
            },
        });
    },
};