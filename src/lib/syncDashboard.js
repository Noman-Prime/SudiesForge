import mongoose from "mongoose";
import connect from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const syncDashboard = async () => {
    await connect();

    const database = mongoose.connection.db;

    if (!database) {
        throw new Error("MongoDB connection is not available");
    }

    const list = await database
        .listCollections({}, { nameOnly: true })
        .toArray();

    const collections = [];

    for (const item of list) {
        if (item.name.startsWith("system.")) {
            continue;
        }

        const count = await database
            .collection(item.name)
            .estimatedDocumentCount();

        const name = item.name
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (character) => character.toUpperCase());

        collections.push({
            key: item.name,
            name,
            count,
        });
    }

    const { env } = await getCloudflareContext({ async: true });

    if (!env.NAVIGATION_KV) {
        throw new Error("NAVIGATION_KV binding is missing");
    }

    const dashboard = {
        collections,
        updatedAt: new Date().toISOString(),
    };

    await env.NAVIGATION_KV.put(
        "dashboard",
        JSON.stringify(dashboard),
    );

    return dashboard;
};

export default syncDashboard;