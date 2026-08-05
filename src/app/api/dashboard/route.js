import { deashbord } from "@/controllers/dashboard";
import {
    isAdmin,
    isTokenAuthenticated,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async (req) => {
    const auth = isTokenAuthenticated(req);

    if (!auth.user) {
        return auth;
    }

    const admin = isAdmin("admin")(auth.user);

    if (admin) {
        return admin;
    }

    return deashbord();
};