import { deleteEvent, getSingleEvent, updateEvent } from "@/controllers/event"
import { isAdmin, isAuthenticated } from "@/lib/auth"

export const GET = async (_req, { params }) => {
    const { id } = await params
    return getSingleEvent(id)
}

export const PUT = async (req, { params }) => {
    const { id } = await params
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }

    const adminResponse = isAdmin("admin")(auth.user)
    if (adminResponse) {
        return adminResponse
    }
    return updateEvent(req, id)
}

export const DELETE = async (req, { params }) => {
    const { id } = await params
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }

    const adminResponse = isAdmin("admin")(auth.user)
    if (adminResponse) {
        return adminResponse
    }
    return deleteEvent(id)
}