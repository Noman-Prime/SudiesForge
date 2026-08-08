import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

const noCacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "CDN-Cache-Control": "no-store",
    "Cloudflare-CDN-Cache-Control": "no-store",
};

export const deashbord = async () => {
    try {
        const { env } = await getCloudflareContext({
            async: true,
        });

        if (!env.NAVIGATION_KV) {
            throw new Error("NAVIGATION_KV binding is missing");
        }

        const dashboard = await env.NAVIGATION_KV.get(
            "dashboard",
            "json",
        );

        if (
            !dashboard ||
            !Array.isArray(dashboard.collections)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Dashboard has not been synchronized",
                    collection: [],
                    updatedAt: null,
                },
                {
                    status: 503,
                    headers: noCacheHeaders,
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
                collection: dashboard.collections,
                updatedAt: dashboard.updatedAt || null,
            },
            {
                status: 200,
                headers: noCacheHeaders,
            },
        );
    } catch (error) {
        console.error("Dashboard KV read failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Dashboard could not be loaded",
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