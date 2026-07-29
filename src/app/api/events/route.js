import { createEvent, getAllEvents } from "@/controllers/event"
import { isAdmin, isAuthenticated } from "@/lib/auth"

export const POST = async (req) => {
    const auth = await isAuthenticated(req)
    if (!auth.user) {
        return auth
    }

    const adminResponse = isAdmin("admin")(auth.user)
    if (adminResponse) {
        return adminResponse
    }

    return createEvent(req)
}

export const GET = async () => {
    return getAllEvents()
}