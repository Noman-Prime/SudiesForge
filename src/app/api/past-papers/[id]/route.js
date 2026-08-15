import {
    deletePastPaper,
    getPastPaper,
    updatePastPaper
} from "@/controllers/pastpaper"
import {
    isAdmin,
    isAuthenticated
} from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const GET = async (req, { params }) => {
    const { id } = await params

    return getPastPaper(req, id)
}

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

    return updatePastPaper(req, id)
}

export const DELETE = async (req, { params }) => {
    const { id } = await params

    const auth = await isAuthenticated(req)

    if (!auth.user) {
        return auth
    }

    const admin = isAdmin("admin")(auth.user)

    if (admin) {
        return admin
    }

    return deletePastPaper(req, id)
}