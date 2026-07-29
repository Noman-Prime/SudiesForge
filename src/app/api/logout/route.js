import { logOut } from "@/controllers/user"
import { isAuthenticated } from "@/lib/auth"

export const POST = async (req) => {
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }
    return logOut()
}