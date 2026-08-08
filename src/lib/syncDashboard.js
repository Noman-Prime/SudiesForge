import mongoose from "mongoose";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const syncDashboard = async () => {
    let connection;

    try {
        if (!process.env.DB_URL) {
            throw new Error("DB_URL environment variable is missing");
        }

        const { env } = await getCloudflareContext({
            async: true,
        });

        if (!env.NAVIGATION_KV) {
            throw new Error("NAVIGATION_KV binding is missing");
        }

        connection = mongoose.createConnection(
            process.env.DB_URL,
            {
                maxPoolSize: 1,
                minPoolSize: 0,
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 30000,
                family: 4,
            },
        );

        await connection.asPromise();

        const database = connection.db;

        if (!database) {
            throw new Error("MongoDB connection is unavailable");
        }

        const collectionList = await database
            .listCollections({}, { nameOnly: true })
            .toArray();

        const collections = await Promise.all(
            collectionList
                .filter(
                    (item) => !item.name.startsWith("system."),
                )
                .map(async (item) => {
                    const count = await database
                        .collection(item.name)
                        .estimatedDocumentCount();

                    const name = item.name
                        .replace(/[-_]/g, " ")
                        .replace(/\b\w/g, (character) =>
                            character.toUpperCase(),
                        );

                    return {
                        key: item.name,
                        name,
                        count,
                    };
                }),
        );

        collections.sort((first, second) =>
            first.name.localeCompare(second.name),
        );

        const dashboard = {
            collections,
            updatedAt: new Date().toISOString(),
        };

        await env.NAVIGATION_KV.put(
            "dashboard",
            JSON.stringify(dashboard),
        );

        return dashboard;
    } finally {
        if (connection) {
            await connection.close().catch((error) => {
                console.error(
                    "Dashboard MongoDB connection close failed:",
                    error,
                );
            });
        }
    }
};

export default syncDashboard;