import { deashbord } from "@/controllers/dashboard";
import {
    isAdmin,
    isTokenAuthenticated,
} from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async (req) => {
    try {
        const auth = isTokenAuthenticated(req);

        if (!auth.user) {
            return auth;
        }

        const admin = isAdmin("admin")(auth.user);

        if (admin) {
            return admin;
        }

        return await deashbord();
    } catch (error) {
        console.error("Dashboard route failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Dashboard could not be loaded",
                collection: [],
            },
            { status: 500 },
        );
    }
};