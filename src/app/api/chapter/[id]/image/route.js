import { createOrUpdateImage } from "@/controllers/chapter"
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

    return createOrUpdateImage(req, id)
}