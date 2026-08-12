import connect from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const noCacheHeaders = {
    "Cache-Control":
        "no-store, no-cache, must-revalidate",
};

export const deashbord = async () => {
    try {
        await connect();

        const databaseCollections =
            await mongoose.connection.db
                .listCollections(
                    {},
                    { nameOnly: true },
                )
                .toArray();

        const validCollections =
            databaseCollections.filter(
                (item) =>
                    !item.name.startsWith(
                        "system.",
                    ),
            );

        const collections = await Promise.all(
            validCollections.map(
                async (item) => {
                    const count =
                        await mongoose.connection.db
                            .collection(item.name)
                            .estimatedDocumentCount();

                    return {
                        key: item.name,
                        name:
                            item.name
                                .charAt(0)
                                .toUpperCase() +
                            item.name.slice(1),
                        count,
                    };
                },
            ),
        );

        return NextResponse.json(
            {
                success: true,
                collection: collections,
                updatedAt:
                    new Date().toISOString(),
            },
            {
                status: 200,
                headers: noCacheHeaders,
            },
        );
    } catch (error) {
        console.error(
            "Dashboard loading failed:",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Dashboard could not be loaded",
                collection: [],
                updatedAt: null,
            },
            {
                status: 500,
                headers: noCacheHeaders,
            },
        );
    }
};