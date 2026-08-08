import connect from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const deashbord = async () => {
    try {
        await connect();

        const database = mongoose.connection.db;

        if (!database) {
            throw new Error("Database connection is unavailable");
        }

        const collectionList = await database
            .listCollections({}, { nameOnly: true })
            .toArray();

        const collections = [];

        for (const item of collectionList) {
            if (item.name.startsWith("system.")) {
                continue;
            }

            const count = await database
                .collection(item.name)
                .estimatedDocumentCount();

            const name = item.name
                .replace(/[-_]/g, " ")
                .replace(/\b\w/g, (character) =>
                    character.toUpperCase(),
                );

            collections.push({
                key: item.name,
                name,
                count,
            });
        }

        return NextResponse.json(
            {
                success: true,
                collection: collections,
            },
            {
                status: 200,
                headers: {
                    "Cache-Control":
                        "no-store, no-cache, must-revalidate",
                    "CDN-Cache-Control": "no-store",
                    "Cloudflare-CDN-Cache-Control": "no-store",
                },
            },
        );
    } catch (error) {
        console.error("Dashboard database read failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Dashboard could not be loaded",
            },
            { status: 500 },
        );
    }
};