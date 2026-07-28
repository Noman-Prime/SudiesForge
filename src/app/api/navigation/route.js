
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const { env } = getCloudflareContext()
        const events = await env.NAVIGATION_KV.get("events", "json");

        return NextResponse.json({
            success: true,
            event: events || []
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: "Navigation could not be loaded"
        }, { status: 500 });
    }
};