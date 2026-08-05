import syncDashboard from "@/lib/syncDashboard";
import { isAdmin, isAuthenticated } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const POST = async (req) => {
    const providedSecret = req.headers.get(
        "x-dashboard-sync-secret",
    );

    const isScheduledRequest =
        providedSecret &&
        providedSecret === process.env.DASHBOARD_SYNC_SECRET;

    if (!isScheduledRequest) {
        const auth = await isAuthenticated(req);

        if (!auth.user) {
            return auth;
        }

        const admin = isAdmin("admin")(auth.user);

        if (admin) {
            return admin;
        }
    }

    try {
        const dashboard = await syncDashboard();

        return NextResponse.json(
            {
                success: true,
                message: "Dashboard synchronization completed",
                collection: dashboard.collections,
                updatedAt: dashboard.updatedAt,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Dashboard synchronization failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Dashboard synchronization failed",
            },
            { status: 500 },
        );
    }
};