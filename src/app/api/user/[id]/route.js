import { deleteUser, updateUser } from "@/controllers/user"
import { isAuthenticated } from "@/lib/auth"

export const PUT = async (req) => {
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }
    return updateUser(req, auth.user._id)
}

export const DELETE = async (req) => {
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }
    return deleteUser(auth.user._id)
}