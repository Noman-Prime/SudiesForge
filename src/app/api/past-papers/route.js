import {
    createPastPaper,
    getAllPastPapers
} from "@/controllers/pastpaper"
import {
    isAdmin,
    isAuthenticated
} from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const POST = async (req) => {
    const auth = await isAuthenticated(req)

    if (!auth.user) {
        return auth
    }

    const admin = isAdmin("admin")(auth.user)

    if (admin) {
        return admin
    }

    return createPastPaper(req)
}

export const GET = async (req) => {
    return getAllPastPapers(req)
}