import { deashbord } from "@/controllers/dashboard"
import { isAdmin, isAuthenticated } from "@/lib/auth"

export const GET = async (req) => {
    // const auth = await isAuthenticated(req)
    // if (!auth.user) {
    //     return auth
    // }

    // const admin = isAdmin("admin")(auth.user)
    // if (admin) {
    //     return admin
    // }
    return deashbord(req)
}