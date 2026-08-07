import { deleteSlider, getSlider, updateSlider } from "@/controllers/slider"
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

    return updateSlider(req, id)
}

export const GET = async (_req, { params }) => {
    const { id } = await params
    return getSlider(_req, id)
}

export const DELETE = async (req, { params }) => {
    const { id } = await params
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }
    const Admin = isAdmin("admin")(auth.user)
    if (Admin) {
        return Admin
    }

    return deleteSlider(req, id)
}