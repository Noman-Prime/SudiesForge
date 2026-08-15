import { getPastPaper } from "@/controllers/pastpaper"
import {
    isAdmin,
    isAuthenticated
} from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const GET = async (req, { params }) => {
    const { id } = await params

    const auth = await isAuthenticated(req)

    if (!auth.user) {
        return auth
    }

    const admin = isAdmin("admin")(auth.user)

    if (admin) {
        return admin
    }

    return getPastPaper(req, id, true)
}