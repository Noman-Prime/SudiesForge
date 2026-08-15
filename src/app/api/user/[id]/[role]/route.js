import { updateUserRole } from "@/controllers/user"
import { isAdmin, isAuthenticated } from "@/lib/auth"

export const PUT = async (req, { params }) => {
    const { id } = await params

    const auth = await isAuthenticated(req)

    if (!auth.user) {
        return auth
    }

    const admin = isAdmin("admin")(auth.user)

    if (admin) {
        return admin
    }

    return updateUserRole(req, id, auth.user._id)
}