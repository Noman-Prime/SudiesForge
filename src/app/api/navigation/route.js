import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async () => {
  try {
    const { env } = await getCloudflareContext({ async: true });

    if (!env.NAVIGATION_KV) {
      throw new Error("NAVIGATION_KV binding is missing");
    }

    const events = await env.NAVIGATION_KV.get("events", "json");

    return NextResponse.json(
      {
        success: true,
        event: events || [],
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
    console.error("Navigation KV read failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Navigation could not be loaded",
      },
      { status: 500 },
    );
  }
};