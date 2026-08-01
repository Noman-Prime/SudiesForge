import { updatePassword } from "@/controllers/user"
import { isAuthenticated } from "@/lib/auth"

export const PUT = async (req) => {
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }
    return updatePassword(req, auth.user._id)
}