import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const deashbord = async () => {
    try {
        const { env } = await getCloudflareContext({ async: true });

        if (!env.NAVIGATION_KV) {
            throw new Error("NAVIGATION_KV binding is missing");
        }

        const dashboard = await env.NAVIGATION_KV.get(
            "dashboard",
            "json",
        );

        return NextResponse.json(
            {
                success: true,
                collection: dashboard?.collections || [],
                updatedAt: dashboard?.updatedAt || null,
            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                    "CDN-Cache-Control": "no-store",
                    "Cloudflare-CDN-Cache-Control": "no-store",
                },
            },
        );
    } catch (error) {
        console.error("Dashboard KV read failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Dashboard could not be loaded",
            },
            { status: 500 },
        );
    }
};